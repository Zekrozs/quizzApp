'use strict'

let DOM ={
 slider: document.querySelector('.slider'),
 card: document.querySelectorAll('.card'),
 quizzButton: document.querySelector('.next'),
 wholePage: document.querySelector('.main-wrapper'),
 selection: document.querySelectorAll('.selection'),
 Question: document.querySelector('.questions'),
 option: document.querySelectorAll('.answer'),
 currentQuestionNumber: document.querySelector('.currentQuestion'),
 answerDOM: document.querySelectorAll('input[name = "option"]')
}

let state = {
    allQuizzes: null,
    currentIndex: 0,
    score: 0,
    activeQuizz: null
}

// load the prefered user theme on page load
const savedTheme = localStorage.getItem('theme')

if(savedTheme === 'dark'){
    changeTheme()
    DOM.slider.checked = true
}


function changeTheme(){
    document.body.classList.toggle('dark-mode')

    const darkIcons= document.querySelectorAll('.dark-icon')
    const lightIcons= document.querySelectorAll('.light-icon')

   darkIcons.forEach(icon =>icon.classList.toggle('hidden'))
   lightIcons.forEach(icon =>icon.classList.toggle('hidden'))

}

function saveTheme(){
     const darkMode = document.body.classList.contains('dark-mode')

    if(darkMode){
        localStorage.setItem('theme', 'dark')
    }
    else{
        localStorage.setItem('theme', 'light')
    }
}

async function fetchAnswers(){
    try{
     const response = await fetch('https://raw.githubusercontent.com/Zekrozs/quizzApp/refs/heads/main/data.json')
     if (!response.ok){
      // exit the try and go immedietly to the cathc
        throw new Error(`error cant't fetch quizzes!, Status : ${response.status}`)
     }
       state.allQuizzes = await response.json()
     
    } catch(error){
     // log the error in th console
    console.error('someting went wrong', error)
    
    alert(`something went wrong, please try again later`)
    }
    
}

fetchAnswers()


function specifySelectedQuiz(options){

     state.activeQuizz = state.allQuizzes['quizzes'].find(quizz => quizz.title == options.id)
    
}

function updateSubjectAndIcon(){
    if (state.allQuizzes){
 const quizzSubject = document.querySelectorAll('.quizzSubject')
const quizzIcon = document.querySelectorAll('.quizzIcon')
const quizzIconContainer = document.querySelectorAll('.quizzIconContainer')

 quizzSubject.forEach((item ,index) =>{
    quizzSubject[index].textContent = state.activeQuizz.title
    quizzIcon[index].src = state.activeQuizz.icon
 })
//  this styles the subject boxes on the end page and to left of the quiz page
 quizzIconContainer.forEach(container => container.classList.add(`${state.activeQuizz.title}-icon`))

    }
  
}

function showBar(){
    let progressBar = document.querySelector('.progressBarContainer')
    progressBar.classList.remove('hidden')
}


function loadQuestions(){
    const currentData = state.activeQuizz.questions[state.currentIndex]
    const {question, options} = currentData
    DOM.Question.textContent = question
    DOM.option.forEach((option, index) =>{option.textContent = options[index]
    } )
    
    // to make the validation logic depndent on data instead of text content from DOM elements
    DOM.answerDOM.forEach((answer,index) => answer.value = index)
}

function switchToQuizScreen(){
    const welcomeText = document.querySelector('.welcomeText')
    const pickSubjectText = document.querySelector('.welcome')
    DOM.Question.classList.remove('hidden')
    welcomeText.classList.add('hidden')
    pickSubjectText.classList.add('hidden')

    DOM.card.forEach(card => card.classList.add('hidden'))
    DOM.selection.forEach(selection => selection.classList.remove('hidden') )
    DOM.quizzButton.classList.remove('hidden')
}


function progressVisual(){
const trackBar = document.querySelector('.progressBar')
const min = 0
const max = state.activeQuizz.questions.length
const progress = state.currentIndex
// percentage is used as custom property to calculate the width of the progress bar
const percentage = (progress - min) / (max - min) * 100 
trackBar.style.setProperty('--slider-progress', `${percentage}%`)
 DOM.currentQuestionNumber.textContent = `${state.currentIndex + 1} out of ${max}`

}

function nextQuestion(){
    state.currentIndex++
}



function clearStateForNextQ(){

    DOM.selection.forEach((selection,index) => {
     selection.classList.remove('showCorrectIcon','correctAnswerCard','showWrongIcon','wrongAnswerCard')
     selection.querySelector('.Letter').classList.remove('correctAnswerBox','wrongAnswerBox')
    })
    DOM.quizzButton.textContent = 'Submit Answer'
  

}

function ValidateAnswers(){

    const selectedAnswer = document.querySelector('input[name="option"]:checked')
    const noAnswer = document.querySelector('.error')
    if (!selectedAnswer){
     noAnswer.classList.remove('hidden')
     return false

}
   else{
    noAnswer.classList.add('hidden')
}
  

const parentCard = selectedAnswer.closest('.selection')
const selectedAnswerIndex = Number(selectedAnswer.value)
const optionBox = parentCard.querySelector('.Letter')
const currentData = state.activeQuizz.questions[state.currentIndex]
// i changed the correct answer from text to correctAnswerIndex in the JSON
const {correctAnswerIndex} = currentData

 if(selectedAnswerIndex !== correctAnswerIndex){
        parentCard.classList.add('showWrongIcon','wrongAnswerCard')
        optionBox.classList.add('wrongAnswerBox')
        DOM.selection.forEach((selection,index) => {
            if (index == correctAnswerIndex){
                selection.classList.add('showCorrectIcon')
                selection.querySelector('.Letter').classList.add('correctAnswerBox')
               
            }
          })
        //   for the score function
          return false
          
    }

    else{
        parentCard.classList.add('showCorrectIcon','correctAnswerCard')
        optionBox.classList.add('correctAnswerBox')
        // for the score function
        return true
      
    }
}

// using the second argument for toggle and giving it true or false depending on the quiz state
function lockOptions(isLocked){
      DOM.selection.forEach(selection => {selection.classList.toggle('noANswerChange', isLocked)
    }
 )
    
}

function increaseScore(answeredCorrectly){
    if(answeredCorrectly){
        state.score++

    }
    
}

// to make sure the state is clear for next question, and not overwrite the cards right and wrong styles
function uncheckAll(){
 document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
}

function displayScore(){
    const userScore = document.querySelector('.score')
    const quizzSection = document.querySelector('.quizz')
    const resultPage = document.querySelector('.result')
    userScore.textContent = state.score
    quizzSection.classList.add('hidden')
    resultPage.classList.remove('hidden')
}

// worker function: sees the present and determains the future after the click either next or finish
function submitQuestion(button){
      const isChecked = Array.from(DOM.answerDOM).some(radio => radio.checked)
      const currentQuizzLength = state.activeQuizz.questions.length
      const answeredCorrectly = ValidateAnswers()

      if(!isChecked){
        return isChecked
      }

       increaseScore(answeredCorrectly)
       uncheckAll()
       lockOptions(true)       

        if (state.currentIndex + 1 !== currentQuizzLength){
             DOM.quizzButton.textContent = 'Next question'
             button.dataset.state = 'next'
        }

        else if (state.currentIndex + 1 == currentQuizzLength){
            DOM.quizzButton.textContent = 'finish quizz'
            button.dataset.state = 'stats'

        }

     }

    //  roker function
function moveToNextQuestion(button){
        nextQuestion()
        clearStateForNextQ()
        progressVisual()
        loadQuestions()
        lockOptions(false)
        button.dataset.state  = 'submit'
}

function startQuiz(subject){
   specifySelectedQuiz(subject) 
   updateSubjectAndIcon()
   switchToQuizScreen()
   loadQuestions()
   uncheckAll()
   showBar()
   progressVisual()

}

function changeState(button){
     const currentState = button.dataset.state

    if(currentState === 'submit'){
    submitQuestion(button)
        
    }


    else if(currentState === 'next'){
       moveToNextQuestion(button)
    }

    else if(currentState === 'stats'){
        displayScore()

    }
}

function refreshPage(){
    window.location.reload()
}


DOM.wholePage.addEventListener('click', e =>{
const target = e.target

if(e.target.id == 'switch'){
    changeTheme()
    saveTheme()
}

const subject = target.closest('[data-quizz]')

if (subject){
 if (!state.allQuizzes) return
   startQuiz(subject) 
}



const button = target.closest('[data-state]')

if (button){
if (!state.allQuizzes) return
changeState(button) 


}

const refreshButton = target.closest('[data-refresh]')

if (refreshButton){
    refreshPage()
}





})


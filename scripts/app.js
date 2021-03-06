// App Object
const cocktailApp = {}

// API Call to get the recipes based on ingredient search
cocktailApp.getRecipes = function (searchTerm) {

  // defining the variable to hold the url string
  let url

  if ($('input').hasClass('ingredient-search')) {
    url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${searchTerm}`
  } else {
    url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`
  }

  return $.ajax({
    url,
    method: 'GET',
    dataType: 'JSON',
  })
    .then((res) => {
      // define empty array to push and store limited number of recipes to
      const recipesToDisplay = []

      // pick random number of recipes to push back to recipesToDisplay function
      for (let i = 0; i <= 30; i++) {

        // Get random recipes from the results object
        const randomIndex = Math.floor(Math.random() * res.drinks.length)

        // breaks out of the for loop if the response is less than the stop condition
        // otherwise the loop will keep going and add undefined to recipesToDisplay
        if (res.drinks.length === 0) {
          break
        }

        // remove the item and then push it
        // this ensures that there will be no repeat recipes in the display function
        const removedItems = res.drinks.splice(randomIndex, 1)
        const itemToAdd = removedItems[0]
        recipesToDisplay.push(itemToAdd)
      }

      // sort the recipes to display in alphabetical order
      recipesToDisplay.sort((a, b) => {
        // solution for sorting in all browsers from
        // https://stackoverflow.com/questions/1969145/sorting-javascript-array-with-chrome
        return a.strDrink < b.strDrink ? -1 : 1
      })

      // Need access to recipesToDisplay
      cocktailApp.displayDrinks(recipesToDisplay)
    })
    .fail(() => {
      if ($('input').hasClass('ingredient-search')) {
        $('.recipes').html(
          '<p class="error-text"> No results found. Please enter different ingredient.</p>'
        )
      } else {
        $('.recipes').html(
          '<p class="error-text"> No results found. Please enter different cocktail.</p>'
        )
      }
      $('input').trigger('focus').addClass('invalid-input')
    })
}

// API call use to get the correct data and passed it to displayRecipes as an object
cocktailApp.getRecipe = (drink) => {
  return $.ajax({
    url: `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drink}`,
    method: 'GET',
    dataType: 'JSON',
  })
    .then((res) => {
      // Getting all necessary data from the recipe to use in displayRecipes function
      const cocktailRecipeArr = res.drinks
      const cocktailRecipeObj = cocktailRecipeArr[0]

      const recipeInfoObj = {
        recipeName: drink,
        ingredients: [],
        ingredientsUnits: [],
        recipeInstructions: cocktailRecipeObj.strInstructions,
        recipeImage: cocktailRecipeObj.strDrinkThumb,
      }

      // Getting the ingredients and  measurement units for the recipe and storing them in arrays
      for (const property in cocktailRecipeObj) {
        if (property.includes('strIngredient')
          && cocktailRecipeObj[property] !== null
          && cocktailRecipeObj[property] !== "") {
          recipeInfoObj.ingredients.push(cocktailRecipeObj[property])
        }
        if (property.includes('strMeasure')
          && cocktailRecipeObj[property] !== null
          && cocktailRecipeObj[property] !== ""
          && cocktailRecipeObj[property]) {
          recipeInfoObj.ingredientsUnits.push(cocktailRecipeObj[property])
        } else if (property.includes('strMeasure')
          && cocktailRecipeObj[property] == undefined) {
          recipeInfoObj.ingredientsUnits.push('Personal Preference')
        }
      }
      cocktailApp.displayRecipes(recipeInfoObj)
    })
}

// Function to implement the different search options
cocktailApp.searchOptions = () => {
  $('.ingredient-search').on('click', (e) => {
    $('.search-mode-two').css('background-color', '#B56629')
    $('.search-mode-one').css('background-color', '#EFAC27')
    $('input')
      .attr('placeholder', 'Enter an ingredient')
      .toggleClass('ingredient-search')
      .removeClass('name-search')
    $('label').html('Enter an Ingredient')
  })

  $('.name-search').on('click', () => {
    $('.search-mode-one').css('background-color', '#B56629')
    $('.search-mode-two').css('background-color', '#EFAC27')
    $('input')
      .attr('placeholder', "Enter a Cocktail")
      .toggleClass('name-search')
      .removeClass('ingredient-search')
    $('label').html('Enter a Cocktail')
  })
}

// Function to configure the submit behaviour when the users enters input
cocktailApp.onSubmit = function () {
  $('form').on('submit', (e) => {
    e.preventDefault()

    // Clearing the recipe-container div
    $('.recipes').html('')

    // Store user input in a variable
    const $userInput = $('input').val().trim()

    if ($userInput !== '') {
      $('input').removeClass('invalid-input')
      // Call the API to return recipes to the user
      if ($('input').hasClass('ingredient-search') || $('input').hasClass('name-search')) {
        cocktailApp.getRecipes($userInput)
      } else {
        $('input')
          .attr('placeholder', "Please enter a valid input")
          .addClass('invalid-input')
      }
    }

    // Clear user input
    $('input').val('')
  })
}

// Function for displaying drinks on the DOM
cocktailApp.displayDrinks = (recipes) => {

  const $drinksList = $('<ul class="recipes__list">')
  // Creating an li element for each recipe element in the array
  $.each(recipes, (index, recipe) => {

    // Appending each li to the ul
    $drinksList.append(`
      <li class="recipes__card">
        <button class="recipes__details">
        <h3 class="recipes__title">${recipe.strDrink}</h3>
        <img class="recipes__img" src="${recipe.strDrinkThumb}"
          alt="Glass of delicious ${recipe.strDrink} beverage.">
        </button>
      </li>
    `)
  })

  $('.recipes').append($drinksList)

  cocktailApp.configureClickBehaviourOnRecipes(recipes)
}


// Function to configure the click behaviour on the recipe cards
cocktailApp.configureClickBehaviourOnRecipes = function (recipes) {
  // Getting the users click on recipe
  $('.recipes__card').on('click', '.recipes__details', function (e) {

    // Get rid of the whitespace at the beginning of the string
    const $drinkTitle = $(this).text().trim()

    $('.recipe').dialog('open')
    cocktailApp.getRecipeBySelection($drinkTitle, recipes)

  })
}


// Configure the recipe selection to use once the user clicks on a recipe
// This will display the recipe in a modal
cocktailApp.getRecipeBySelection = (drinkTitle, recipes) => {

  // Find the index number of selected drink
  const selection = recipes.findIndex((drink) => {
    return drinkTitle === drink.strDrink
  })

  const $drinkSelected = recipes[selection].strDrink
  cocktailApp.getRecipe($drinkSelected)
}


// Function for displaying recipe on the DOM
cocktailApp.displayRecipes = (recipe) => {
  // clear the modal content
  $('.recipe').html("")

  // Creating the UL element
  const $recipeContainer = $('<div class="recipe__container">')

  const $ingredientsList = $('<ul class="recipe__ingredients">')

  recipe.ingredients.forEach((ingredient, index) => {
    $ingredientsList.append(`<li>${ingredient}: ${recipe.ingredientsUnits[index]}</li>`)
  })

  const $recipeContainerImage = $(`
    <div class="recipe__content">
    <h3 class="recipe__title">${recipe.recipeName}</h3>
    <div class="recipe__img"><img src="${recipe.recipeImage}" class="recipe__img" alt="Glass of delicious ${recipe.recipeName} beverage."></div>
    </div>`)

  const $recipeContainerIngredients = $(`<div class="recipe__content">
  <h3 class="recipe__title">Recipe Ingredients</h3>
  </div>`)

  const $recipeContainerInstructions = $(`
    <div class="recipe__content">
    <h3 class="recipe__title">Instructions</h3>
    <p class="recipe__instructions">${recipe.recipeInstructions}</p></div>
    `)

  $($recipeContainerIngredients).append($ingredientsList)

  $recipeContainer.append($recipeContainerImage, $recipeContainerIngredients, $recipeContainerInstructions)

  $('.recipe').append($recipeContainer)

}

// Function for displaying the modal
cocktailApp.displayModal = () => {

  let width = '50%'

  if (($(window).width() <= 900) && ($(window).width() >= 651)) {
    width = '60%';
  } else if (($(window).width() <= 650) && ($(window).width() >= 451)) {
    width = '80%';
  } else if (($(window).width() <= 450) && ($(window).width() >= 200)) {
    width = '100%';
  }

  // Selecting the modal from the DOM
  $('.recipe').dialog({
    autoOpen: false,
    modal: true,
    width,
    maxWidth: 800,
    height: '60%',
    classes: {
      'ui-dialog': 'recipe__outer',
      'ui-dialog-content': 'recipe__container'
    },
    resizable: false,
  })
}


// Code to kick off the app
cocktailApp.init = function () {
  cocktailApp.displayModal()
  cocktailApp.onSubmit()
  cocktailApp.searchOptions()
}


// Everything that needs to run on page load
$(function () {
  cocktailApp.init()
})
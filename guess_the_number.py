import random

def guess_the_number():
    # Set the range for the random number
    low = 1
    high = 100
    
    # Generate a random number between low and high
    number_to_guess = random.randint(low, high)
    
    print(f"Guess the number between {low} and {high}:")
    
    # Initialize number of attempts
    attempts = 0
    
    while True:
        try:
            # Get the user's guess
            user_guess = int(input("Enter your guess: "))
            attempts += 1
            
            # Check if the guess is correct
            if user_guess < number_to_guess:
                print("Too low! Try again.")
            elif user_guess > number_to_guess:
                print("Too high! Try again.")
            else:
                print(f"Congratulations! You guessed the number in {attempts} attempts.")
                break
        except ValueError:
            print("Invalid input. Please enter a number.")

# Start the game
guess_the_number()

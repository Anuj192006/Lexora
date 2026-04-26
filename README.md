# Lexora - AI-Powered Word Guessing Game

Lexora is a full-stack web application similar to Contexto, where you try to guess a secret word and receive a semantic similarity rank for each guess based on natural language processing (NLP) embeddings.

The game is built with a React (Vite) frontend and a Python (FastAPI) backend. The UI features a premium, aesthetic, and minimal glassmorphism design.

## Features
- **AI/ML Integration**: Uses cosine similarity over NLP word embeddings to rank guesses.
- **Modern UI**: Built with Tailwind CSS, Framer Motion, and a clean, premium visual aesthetic.
- **Local Processing**: All AI processing runs completely locally, without relying on external APIs.

## Architecture and AI Logic
### NLP Implementation
The game relies on Word Embeddings (like Word2Vec or GloVe). 
- In NLP, words are mapped to dense high-dimensional vectors (embeddings) such that words with similar meanings are close to each other in the vector space.
- The game backend loads these embeddings into memory.
- When the game starts, a random secret word is selected.
- For every guess, the backend retrieves the vector for the guessed word and computes the **Cosine Similarity** between the guess vector and the secret word vector.
- The similarity score is used to rank your guess against all the words in the vocabulary. Rank 1 means you have successfully guessed the exact secret word!

## Setup Instructions

### 1. Backend Setup (Python)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Ensure FastAPI, uvicorn, numpy, scipy are installed)*
4. **Pretrained Word Embeddings**: 
   By default, the backend creates mock/random embeddings for demonstration purposes. To use real AI capabilities, download a pretrained model such as **GloVe**:
   - Download the GloVe 6B embeddings: [https://nlp.stanford.edu/projects/glove/](https://nlp.stanford.edu/projects/glove/)
   - Extract it and place the `glove.6B.100d.txt` file in the `backend/` directory.
   - Update `main.py` or `nlp_model.py` to point to `glove.6B.100d.txt` in the `NLPModel` initialization.
5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

### 2. Frontend Setup (React/Vite)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Gameplay
- Open the frontend in your browser.
- Type in a word (like "apple", "paris", "pen") and submit your guess.
- The UI will visualize how close your guess is via color bars and ranking numbers.
- Keep guessing until you find the secret word!

Enjoy exploring semantic search and NLP!

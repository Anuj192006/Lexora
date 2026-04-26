from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from datetime import datetime
import nlp_model

app = FastAPI(
    title="Lexora API",
    description="AI-powered word guessing game using NLP embeddings",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nlp_model.init()

game_sessions = {}

class Guess(BaseModel):
    session_id: str
    word: str

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "vocabulary_size": nlp_model.get_vocabulary_size()
    }

@app.post("/start-game")
async def start_game():
    session_id = str(random.randint(100000, 999999))
    secret_word = random.choice(nlp_model.vocabulary)

    game_sessions[session_id] = {
        "secret_word": secret_word,
        "guesses": [],
        "created_at": datetime.now(),
        "game_over": False,
        "is_won": False
    }

    return {
        "session_id": session_id,
        "message": "Game started! Try to guess the secret word.",
        "vocabulary_size": nlp_model.get_vocabulary_size(),
        "hint": f"The secret word starts with '{secret_word[0]}' and has {len(secret_word)} letters."
    }

@app.post("/guess")
async def make_guess(guess: Guess):
    session_id = guess.session_id
    guessed_word = guess.word.lower().strip()

    if session_id not in game_sessions:
        raise HTTPException(status_code=404, detail="Game session not found")

    session = game_sessions[session_id]

    if session["game_over"]:
        raise HTTPException(status_code=400, detail="Game is already over")

    secret_word = session["secret_word"]

    if guessed_word not in nlp_model.vocabulary:
        return {
            "error": True,
            "message": f"'{guessed_word}' is not in the word list. Try a common noun!"
        }

    similarity_score, rank = nlp_model.compute_rank(secret_word, guessed_word)
    is_correct = guessed_word == secret_word.lower()

    session["guesses"].append({
        "word": guessed_word,
        "similarity": similarity_score,
        "rank": rank,
        "timestamp": datetime.now().isoformat()
    })

    if is_correct:
        session["game_over"] = True
        session["is_won"] = True

    return {
        "error": False,
        "guessed_word": guessed_word,
        "similarity_score": similarity_score,
        "rank": rank,
        "total_vocabulary": nlp_model.get_vocabulary_size(),
        "is_correct": is_correct,
        "message": "🎉 Correct! You won!" if is_correct else "Keep going!"
    }

@app.get("/game/{session_id}")
async def get_game_state(session_id: str):
    if session_id not in game_sessions:
        raise HTTPException(status_code=404, detail="Game session not found")

    session = game_sessions[session_id]
    return {
        "session_id": session_id,
        "game_over": session["game_over"],
        "is_won": session["is_won"],
        "guesses_count": len(session["guesses"]),
        "guesses": session["guesses"],
        "vocabulary_size": nlp_model.get_vocabulary_size()
    }

@app.post("/give-up/{session_id}")
async def give_up(session_id: str):
    if session_id not in game_sessions:
        raise HTTPException(status_code=404, detail="Game session not found")

    session = game_sessions[session_id]
    secret_word = session["secret_word"]
    session["game_over"] = True
    session["is_won"] = False

    return {
        "message": f"The secret word was: {secret_word}",
        "secret_word": secret_word,
        "guesses_count": len(session["guesses"])
    }

@app.get("/vocabulary")
async def get_vocabulary_sample(limit: int = 50):
    vocab = nlp_model.vocabulary
    sample = random.sample(vocab, min(limit, len(vocab)))
    return {
        "total_size": len(vocab),
        "sample_size": len(sample),
        "vocabulary": sorted(sample)
    }

@app.get("/stats")
async def get_stats():
    total_sessions = len(game_sessions)
    won_games = sum(1 for s in game_sessions.values() if s["is_won"])
    total_guesses = sum(len(s["guesses"]) for s in game_sessions.values())

    return {
        "total_sessions": total_sessions,
        "won_games": won_games,
        "win_rate": round(won_games / total_sessions * 100, 2) if total_sessions > 0 else 0,
        "total_guesses": total_guesses,
        "vocabulary_size": nlp_model.get_vocabulary_size(),
        "embedding_dimension": nlp_model.embedding_dim
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

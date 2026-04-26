import numpy as np
import os

embeddings = {}
vocabulary = []
embedding_dim = 100

def load_word_list():

    word_list_path = os.path.join(os.path.dirname(__file__), 'word_list.txt')
    if os.path.exists(word_list_path):
        with open(word_list_path, 'r', encoding='utf-8') as f:
            words = list(set([line.strip().lower() for line in f if line.strip()]))
        return words
    return []

def create_random_embeddings():

    global embeddings, vocabulary, embedding_dim
    vocabulary = load_word_list()
    embeddings = {}
    for word in vocabulary:
        np.random.seed(hash(word) % (2**32))
        vec = np.random.randn(embedding_dim).astype(np.float32)
        vec = vec / np.linalg.norm(vec)
        embeddings[word] = vec

def load_embeddings_from_file(filepath):

    global embeddings, vocabulary, embedding_dim
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        embedding_dim = len(lines[0].split()) - 1
        embeddings = {}
        vocabulary = []
        for line in lines:
            parts = line.rstrip().split()
            word = parts[0].lower()
            vector = np.array([float(x) for x in parts[1:]], dtype=np.float32)
            vector = vector / np.linalg.norm(vector)
            embeddings[word] = vector
            vocabulary.append(word)
    except Exception as e:
        print(f"Error loading embeddings: {e}")
        create_random_embeddings()

def get_vector(word):

    return embeddings.get(word.lower().strip())

def compute_similarity(word1, word2):

    vec1 = get_vector(word1)
    vec2 = get_vector(word2)
    if vec1 is None or vec2 is None:
        return 0.0
    similarity = np.dot(vec1, vec2)
    return float(np.clip(similarity, 0.0, 1.0))

def compute_rank(secret_word, guessed_word):

    target_similarity = compute_similarity(secret_word, guessed_word)
    similarities = []
    for word in vocabulary:
        if word != secret_word:
            sim = compute_similarity(secret_word, word)
            similarities.append((word, sim))
    similarities.sort(key=lambda x: x[1], reverse=True)
    rank = len(vocabulary)
    for idx, (word, sim) in enumerate(similarities, 1):
        if word == guessed_word.lower().strip():
            rank = idx
            break
    return round(target_similarity, 4), rank

def get_vocabulary_size():

    return len(vocabulary)

def init(embedding_file=None):

    if embedding_file and os.path.exists(embedding_file):
        load_embeddings_from_file(embedding_file)
    else:
        create_random_embeddings()
    print(f"NLP module loaded with {len(vocabulary)} words (dim={embedding_dim})")
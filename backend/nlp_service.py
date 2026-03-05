import os
from sentence_transformers import SentenceTransformer
import chromadb

# Using L3Cube's Marathi Sentence-BERT for better semantic accuracy 
# in local dialects as requested
MODEL_NAME = "l3cube-pune/marathi-sentence-bert-nli"

class NLPService:
    def __init__(self, db_dir="./chroma_db"):
        self.db_dir = db_dir
        self._model = None
        self._chroma_client = None
        self._collection = None
        
    def _initialize(self):
        """Lazy initialization to save memory if not immediately needed and speed up startup."""
        if self._model is None:
            print(f"Loading NLP Model: {MODEL_NAME}...")
            # This might take a while to download the first time
            self._model = SentenceTransformer(MODEL_NAME)
            
        if self._chroma_client is None:
            print("Initializing ChromaDB persistent storage at:", self.db_dir)
            self._chroma_client = chromadb.PersistentClient(path=self.db_dir)
            self._collection = self._chroma_client.get_or_create_collection(name="marathi_quotes")
            
    def generate_embedding(self, text: str):
        self._initialize()
        # The model encode() returns a numpy array, but chroma expects lists
        return self._model.encode(text).tolist()
        
    def add_quote_to_vector_db(self, quote_id: str, text: str, metadata: dict):
        self._initialize()
        embedding = self.generate_embedding(text)
        self._collection.add(
            ids=[str(quote_id)],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata]
        )
        
    def find_similar_quotes(self, text: str, n_results: int = 3):
        self._initialize()
        query_embedding = self.generate_embedding(text)
        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results

# Expose a singleton-like instance
nlp_layer = NLPService()

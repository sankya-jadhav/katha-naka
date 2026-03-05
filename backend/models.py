from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Location(Base):
    __tablename__ = 'locations'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    trait = Column(String, nullable=True)  # Historic | Educational | Nature | Katta Culture

    quotes = relationship("Quote", back_populates="location")

class Quote(Base):
    __tablename__ = 'quotes'
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    author = Column(String)
    author_bio = Column(Text, nullable=True)   # short Marathi bio, shown on flip
    sentiment = Column(String)
    reference_book = Column(String, nullable=True)
    location_id = Column(Integer, ForeignKey('locations.id'))

    location = relationship("Location", back_populates="quotes")

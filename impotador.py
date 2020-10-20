import glob
import json
from pymongo import MongoClient

myclient = MongoClient("mongodb+srv://hackaton:hackaton@hackaton.5yjsd.gcp.mongodb.net/valijud?retryWrites=true&w=majority")
db = myclient['valijud']
Collection = db['processos']
files = glob.glob("./*.json")


for f in files:
    with open(f) as file:
        Collection.insert_many(json.load(file))
    







import pickle

def run(user_input):
    return eval(user_input)

def load(blob):
    return pickle.loads(blob)

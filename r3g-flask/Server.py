import wandb
import json
from flask import Flask
import numpy as np
from PIL import Image
from matplotlib import pyplot as plt
from os import listdir, walk
from os.path import isfile, join
import re


app = Flask(__name__)
api = wandb.Api()
def startWandb():
    run = api.run("recoprecoce-intui/36mcvs8u")
    im = run.file("FilesResult/DetailedConfusionsMatrix/confMatrixAt0.png").download(replace=True)
    image=Image.open("FilesResult/DetailedConfusionsMatrix/confMatrixAt0.png")
    print(np.asarray(image))

def test():
    p = re.compile(r'.*[.](?=inkml$)[^.]*$')
    listeFichiers = []
    for path, dirs, files in walk("./"):
        print(dirs)
        for filename in files:
            if p.match(filename):
                print(path+'/'+filename)
            #print(fichiers)
            #for file in fichiers :
             #   if p.match(file):
              #      listeFichiers.extend(file)
   # print(listeFichiers)
    
#Cette route permet de récupérer la liste des modèles disponible sur Wandb, après filtration (Requete GET)
@app.route('/models/getModelsNames')
def index():
    runs = api.runs("recoprecoce-intui")
    name_list = []
    for run in runs:
        if run.state == 'finished' and run.tags.count('GLU_Rpz')>0:
            name_list.append(run.name)
    return json.dumps(name_list)

#cette route permet de recuperer l'ensemble des noms des fichiers
@app.route('/models/getMetaData')
def index2():
    fichiers = [f for f in listdir("./") if isfile(join("./", f))]
    return json.dumps(fichiers)


if __name__ == "__main__":
    test()
    app.run()
    startWandb()


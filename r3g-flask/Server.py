"""Programme permettant de faire tourner le serveur utilise par R3G."""

import os
import json
from os import listdir, walk
from os.path import isfile, join
import re
import xml.etree.ElementTree as ET
from flask import Flask, request, flash, redirect
import wandb
from werkzeug.utils import secure_filename

from Class.Hyperparameters import Hyperparameters
from Class.Model import Model

APP = Flask(__name__)
API = wandb.Api()
RUNS = API.runs("recoprecoce-intui")
MODEL_LIST = []
LISTE_FICHIER_INKML = []

UPLOAD_FOLDER = './Upload'
ALLOWED_EXTENSIONS = {'txt', 'csv'}
APP.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    """On verifie que le format du fichier est dans ALLOWED_EXTENSIONS."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def download_hyperparameters():
    """On telecharge tous les fichiers lies aux hyperparametres d'un model."""
    for run in RUNS:
        if not os.path.exists("Hyperparameters/" + run.id):
            if run.state == 'finished' and run.tags.count('maxPoolBetLayers') > 0:
                for files in run.files():
                    if files.name == "best_val_loss_epochs.txt":
                        files.download("Hyperparameters/"+run.id, replace=True)


def download_weights(name):
    """ Telechargement des poids d'un modele dont le nom est passe en parametre. 4 fichier a DL."""
    for run in RUNS:
        if not os.path.exists("Weigths/" + run.id):
            if run.id == name:
                for files in run.files():
                    if files.name == "weights/checkpoint":
                        files.download("Weigths/"+run.id, replace=True)
                    if files.name == "weights/regression.data-00000-of-00002":
                        files.download("Weigths/"+run.id, replace=True)
                    if files.name == "weights/regression.data-00001-of-00002":
                        files.download("Weigths/"+run.id, replace=True)
                    if files.name == "weights/regression.index":
                        files.download("Weigths/"+run.id, replace=True)


def recherche_fichier_inkml():
    """On renvoie les fichiers de BDD."""
    p_1 = re.compile(r'.*[.](?=inkml$)[^.]*$')
    for path, _, files in walk("./BDD"):
        for filename in files:
            if p_1.match(filename):
                LISTE_FICHIER_INKML.append(path+'\\'+filename)
    print LISTE_FICHIER_INKML

def ouverture_fichier_inkml(index):
    """Contenu du fichier inkml."""
    print LISTE_FICHIER_INKML[index]
    tree = ET.parse(LISTE_FICHIER_INKML[index])
    root = tree.getroot()
    for child in root:
        print(child.tag, child.attrib)
        for children in child:
            print(children.tag, children.attrib, children.text)
                #print(fichiers)
            #for file in fichiers :
             #   if p.match(file):
              #      listeFichiers.extend(file)
   # print(listeFichiers)


def start_api_wandb():
    """Au lancement du serveur, on cree des objets de type Model contenant le nom l'id
    et une liste d'hyperparametres pour chaque modeles present sur le board Wandb."""
    param = {}
    for run in RUNS:
        if run.state == 'finished' and run.tags.count('maxPoolBetLayers') > 0:
            if os.path.exists("Hyperparameters/" + run.id + "/best_val_loss_epochs.txt"):
                param[run.id] = []
                with open("Hyperparameters/" + run.id + "/best_val_loss_epochs.txt", "r") as hyper:
                    for line in hyper.readlines():
                        if "argv:" in line:
                            for elt in (line.replace("']\n", "").split(":['")[1]).split("', "):
                                param[run.id].append(Hyperparameters(elt.split("=")[0], \
                                elt.split("=")[1]).__dict__)
                model = Model(run.id, run.name, param[run.id])
                MODEL_LIST.append(model.__dict__)


@APP.route('/models/getModelsNames')
def get_models_names():
    """Cette route permet de recuperer la liste des modeles disponible sur Wandb."""
    return json.dumps(MODEL_LIST)



@APP.route('/models/getModel/<id>')
def get_model(model_id):
    """Cette route permet de recuperer un modele en donnant son id en parametre"""
    for elt in MODEL_LIST:
        if elt["_id"] == model_id:
            return json.dumps(elt)
    return json.dumps({'success':False}), 500, {'ContentType':'application/json'}


#Cette route permet d'uploader un fichier choisi depuis le front-end sur le serveur.
#contenant les hyperparametres, et le fichier texte contenant les sequences.
# On va utiliser ces 2 fichiers pour lancer un apprentissage
@APP.route('/models/uploadFile/<name>', methods=['GET', 'POST'])
def upload_file(name):
    """Permet de telecharger un fichier depuis le front end."""
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            if not os.path.exists('./Upload/'+name):
                os.mkdir('./Upload/'+name)
            APP.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER+'/'+name
            file.save(os.path.join(APP.config['UPLOAD_FOLDER'], filename))
            return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
    return json.dumps({'success':False}), 500, {'ContentType':'application/json'}


@APP.route('/models/getMetaData')
def index2():
    """Cette route permet de recuperer l'ensemble des noms des fichiers."""
    fichiers = [f for f in listdir("./") if isfile(join("./", f))]
    return json.dumps(fichiers)


if __name__ == "__main__":
    #recherche_fichier_inkml()
    #ouverture_fichier_inkml(2)
    download_hyperparameters()
    start_api_wandb()
    download_weights("ra6r8k85")
    APP.run(host='0.0.0.0')
    
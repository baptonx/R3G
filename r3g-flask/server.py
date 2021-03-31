"""Programme permettant de faire tourner le serveur utilise par R3G."""

import os
import json
import subprocess
import sys
import configparser
import ast
import tkinter.filedialog
from os import walk
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
LISTE_PATH_BDD = {} #= {"BDD": "./BDD", "BDD_chalearn_inkml" : "./BDD_chalearn_inkml"}
LISTE_FICHIER_INKML = {}
METADONNEE = {}
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


@APP.route('/models/startLearning/<name>')
def start_learning(name):
    """Permet de lancer l'apprentissage d'un model en runnant un script shell"""
    path = ""
    sequences = ""
    csv = ""
    if os.path.exists('./Upload/' + name):
        for file in os.listdir("./Upload/" + name):
            if file == 'sequences.txt':
                sequences = "./Upload/" + name + '/' + file
            if file == 'ia.txt':
                with open("./Upload/" + name + '/' + file) as file_content:
                    path = file_content.readlines()[0]
            if file not in ('sequences.txt', 'ia.txt'):
                csv = "./Upload/" + name + '/' + file
        if os.path.isfile(path):
            subprocess.call([sys.executable, path, sequences, csv])
        else:
            return json.dumps({'success': False}), 500, {'ContentType': 'application/json'}

    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}



#############Exploration methode##############

def get_last_config():
    """lire les dernière variables enregistrer pour recharger
    la même configuration si un fichier Config_Server existe"""
     # lecture du fichier
    # pylint: disable-msg=global-statement
    global LISTE_PATH_BDD
    global LISTE_FICHIER_INKML
    global METADONNEE

    fcfg = 'config.ini'
    cfg = configparser.ConfigParser()

    if len(cfg.read(fcfg)) == 1:

        # lecture des valeurs
        LISTE_PATH_BDD = ast.literal_eval(cfg['server']['LISTE_PATH_BDD'])
        LISTE_FICHIER_INKML = ast.literal_eval(cfg['server']['LISTE_FICHIER_INKML'])
        METADONNEE = ast.literal_eval(cfg['server']['METADONNEE'])
    else:
        print("no config file")

def save_config():
    """sauvegarde des dernieres valeurs lues"""
    fcfg = 'config.ini'
    cfg = configparser.ConfigParser()
    # modification des valeurs
    cfg['server'] = {'LISTE_PATH_BDD': str(LISTE_PATH_BDD),
                     'LISTE_FICHIER_INKML': str(LISTE_FICHIER_INKML),
                     'METADONNEE': str(METADONNEE)}
    #cfg['server']['LISTE_FICHIER_INKML'] = str(LISTE_FICHIER_INKML)
    #cfg['server']['METADONNEE'] = str(METADONNEE)
    # écriture du fichier modifié
    with open(fcfg, 'w') as file:
        cfg.write(file)

def recherche_fichier_inkml():
    """On renvoie les fichiers de BDD."""
    # pylint: disable-msg=global-statement
    global METADONNEE
    METADONNEE = {}
    p_1 = re.compile(r'.*[.](?=inkml$)[^.]*$')
    for namebdd, pathbdd in LISTE_PATH_BDD.items():
        metadonnes = []
        liste_fichier_in = {}
        for path, _, files in walk(pathbdd):
            for filename in files:
                if p_1.match(filename):
                    liste_fichier_in[filename] = path+'/'+filename
                    metadonnes.append(get_meta_donnee(filename, namebdd))
        if len(liste_fichier_in) != 0:
            LISTE_FICHIER_INKML[namebdd] = liste_fichier_in
        METADONNEE[namebdd] = metadonnes

def ajout_fichiers_inkml_in(pathbdd):
    """On ajoute les fichiers de présent à ce path BDD."""
    # pylint: disable-msg=global-statement
    p_1 = re.compile(r'.*[.](?=inkml$)[^.]*$')
    p_2 = re.compile(r'[^/]*$')
    namebdd = p_2.search(pathbdd)
    liste_fichier_in = {}
    global METADONNEE
    for path, _, files in walk(pathbdd):
        metadonnes = []
        for filename in files:
            if p_1.match(filename):
                liste_fichier_in[filename] = path+'/'+filename
                metadonnes.append(get_meta_donnee(filename, namebdd))
        if len(liste_fichier_in) != 0:
            LISTE_FICHIER_INKML[namebdd] = liste_fichier_in
        METADONNEE[namebdd] = metadonnes

def suppresion_fichiers_inkml(bdd):
    """ferme une bdd """
    print(bdd)
def get_meta_donnee(filename, bdd):
    # pylint: disable-msg=too-many-locals
    # pylint: disable-msg=too-many-branches
    """Contenu du fichier inkml."""
    filepath = LISTE_FICHIER_INKML[bdd][filename]
    name = filename
    format_donnee = {}
    annotations = {}
    others = {}
    tree = ET.parse(filepath)
    root = tree.getroot()
    nb_annotation = 0
    nb_others = 0
    for child in root:
        if child.tag == "{http://www.w3.org/2003/InkML}traceFormat":
            for children in child:
                format_donnee[children.attrib['name']] = children.attrib['type']
        elif child.tag == "{http://www.w3.org/2003/InkML}annotationXML":
            if child.attrib == {'type': 'actions'}:
                action = {}
                nb_annotation += 1
                for children in child:
                    action[children.attrib['type']] = children.text
                annotations[nb_annotation] = action
            else:
                ##récupere les annotations non implÃ©menter(autres que capteur, user, action)
                other = {}
                nb_others += 1
                for children in child:
                    other[children.attrib['type']] = children.text
                others[child.attrib['type']] = other
        elif child.tag == "{http://www.w3.org/2003/InkML}traceGroup":
            break
    metadonnee = {"id": name, "BDD": bdd, "format": format_donnee,
                  "annotation": annotations, "metadonnees": others}
    return metadonnee

def get_donnee(filename, bdd):
    """Contenu du fichier inkml."""
    filepath = LISTE_FICHIER_INKML[bdd][filename]
    donnees = {}
    tree = ET.parse(filepath)
    root = tree.getroot()
    nb_articulations = 0
    for child in root:
        if child.tag == "{http://www.w3.org/2003/InkML}traceGroup":
            for children in child:
                if children.tag == "{http://www.w3.org/2003/InkML}trace":
                    dict_final = []
                    dict_1 = children.text.split(", ")
                    for point in dict_1:
                        tab_2 = point.split(" ")
                        dict_final.append(tab_2)
                    donnees[nb_articulations] = dict_final
                    nb_articulations += 1
    return donnees

#############Exploration route :##############

@APP.route('/models/getMetaDonnee')
def route_get_meta_donne():
    """Permet de télécharger l'ensemble des méta_donnée"""
    return json.dumps(METADONNEE)

@APP.route('/models/getListBDD')
def route_get_list_bdd():
    """Permet de télécharger la liste des BDD"""
    return json.dumps(list(LISTE_PATH_BDD.keys()))

#cette route permet de recuperer la sequence du fichier namefichier
@APP.route('/models/getDonnee/<namefichier>')
def route_get_sequence(namefichier, bdd):
    """Permet de télécharger donnée a partir du nom de fichier """
    if namefichier in LISTE_FICHIER_INKML[bdd]:
        recherche_fichier_inkml()
    return json.dumps(get_donnee(namefichier, bdd))

@APP.route('/models/addBDD')
def route_add_bdd():
    """add new path ddb"""
    root = tkinter.Tk()
    root.withdraw()
    path = tkinter.filedialog.askdirectory()
    print(path)
    #Permet de télécharger donnée a partir du nom de fichier
    p_2 = re.compile(r'[^/]*$')
    namebdd = p_2.search(path)
    print(namebdd)
    if namebdd is not None:
        print(namebdd)
        if namebdd not in LISTE_PATH_BDD:
            LISTE_PATH_BDD[namebdd] = path
            ajout_fichiers_inkml_in(path)
    save_config()
    return json.dumps(METADONNEE)

@APP.route('/models/closeBDD/<nameBDD>')
def route_close_bdd(name):
    """Permet de télécharger donnée a partir du nom de fichier """
    p_2 = re.compile(r'[^/]*$')
    namebdd = p_2.search(name)
    if namebdd is not None:
        if namebdd in LISTE_PATH_BDD:
            del LISTE_PATH_BDD[namebdd]
            suppresion_fichiers_inkml(namebdd)
    save_config()

@APP.route('/models/reload/<nameBDD>')
def route_reload_bdd(name):
    """Permet de télécharger donnée a partir du nom de fichier """
    p_2 = re.compile(r'[^/]*$')
    namebdd = p_2.search(name)
    if namebdd is not None:
        if namebdd in LISTE_PATH_BDD:
            #path = LISTE_PATH_BDD[namebdd]
            recherche_fichier_inkml()
    save_config()

if __name__ == "__main__":

    get_last_config()
    download_hyperparameters()
    start_api_wandb()
    download_weights("ra6r8k85")
    start_learning('mo6')
    APP.run(host='0.0.0.0')
    LISTE_PATH_BDD["BDD_chalearn_inkml"] = "./BDD_chalearn_inkml"
    save_config()

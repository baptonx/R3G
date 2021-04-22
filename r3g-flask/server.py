# -*- coding: utf-8 -*-
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
from shutil import copyfile
from flask import Flask, request, flash, redirect
import wandb
from werkzeug.utils import secure_filename
from Class.Hyperparameters import Hyperparameters
from Class.Model import Model
from Class.Annotation import Annotation





APP = Flask(__name__)
API = wandb.Api()
RUNS = API.runs("precoce3d-OC3D")
MODEL_LIST = []
CLASSES = []
LISTE_PATH_BDD = {}
LISTE_FICHIER_INKML = {}
LISTE_GESTE_BDD = {}
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
    """ Telechargement des poids d'un modele dont le nom est passe en parametre. 5 fichier a DL."""
    for run in RUNS:
        if not os.path.exists("Weigths/" + run.id):
            if run.id == name:
                for files in run.files():
                    if files.name == "weights/Weights/checkpoint":
                        files.download("Weigths/"+run.id, replace=True)
                    if files.name == "weights/Weights/model.data-00000-of-00002":
                        files.download("Weigths/"+run.id, replace=True)
                    if files.name == "weights/Weights/model.data-00001-of-00002":
                        files.download("Weigths/"+run.id, replace=True)
                    if files.name == "weights/Weights/model.index":
                        files.download("Weigths/"+run.id, replace=True)
                    if files.name == 'weights/config.txt':
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

def start_wandb_v2():
    """v2 pour l'autre depot"""
    param = {}
    for run in RUNS:
        param[run.id] = []
        model = Model(run.id, run.name, param[run.id])
        MODEL_LIST.append(model.__dict__)
    print(MODEL_LIST)

@APP.route('/models/getModelsNames')
def get_models_names():
    """Cette route permet de recuperer la liste des modeles disponible sur Wandb."""
    return json.dumps(MODEL_LIST)

@APP.route('/models/getClasses/<bdd>')
def get_classes(bdd):
    """exemple : obtenir les classes de la BDD charlearn"""
    bdd=bdd.replace('_inkml','')
    ret=[]
    if os.path.exists('./'+bdd+'/tabclass.txt'):
        with open('./'+bdd+'/tabclass.txt') as file_content:
            for line in file_content:
                ret.append(line.split(';')[1].replace('\n',''))
                CLASSES.append(line.split(';')[1].replace('\n',''))
    else:
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}
    return json.dumps(ret)



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


@APP.route('/models/evaluation/<name>/<sequences>/<model>')
def evaluation(name,sequences,model):
    """ on fait l'evaluation de sequences avec le model passé en param"""
    download_weights(model)
    name=name.replace('_inkml','')
    seq=sequences.split(',')
    if len(CLASSES) == 0:
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}
    for fichier in os.listdir('./Sequences'):
        if os.path.exists('./Sequences/'+fichier):
            os.remove('./Sequences/'+fichier)
        else:
            print("The file does not exist")
    for fichier in os.listdir('./EvaluationSequences'):
        if os.path.exists('./EvaluationSequences/'+fichier):
            os.remove('./EvaluationSequences/'+fichier)
        else:
            print("The file does not exist")
    for elt in seq:
        copyfile('./'+name+'/Data/'+elt.replace('.inkml','')+'.txt','./Sequences/'+\
        elt.replace('.inkml','')+'.txt')
    subprocess.call([sys.executable, "SequenceEvaluator.py", "Sequences/", "EvaluationSequences/", \
    "Weigths/"+model+'/weights/'])
    ret = {}
    for file in os.listdir('./EvaluationSequences/'):
        with open('./EvaluationSequences/' + file) as file_content:
            frame = 0
            liste_annotation = []
            tab = file_content.readlines()[1].split(' ')
            for elt in tab:
                id_geste=elt.split(';')[0]
                nb_frame=elt.split(';')[1]
                annotation = Annotation(frame,frame+int(nb_frame),0,CLASSES[int(id_geste)])
                frame = frame + int(nb_frame)
                liste_annotation.append(annotation.__dict__)
        ret[file.replace('txt','inkml')] = liste_annotation
    return json.dumps(ret)


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
    global LISTE_PATH_BDD
    global LISTE_FICHIER_INKML
    global METADONNEE
    global LISTE_GESTE_BDD

    fcfg = 'config.ini'
    cfg = configparser.ConfigParser()

    if len(cfg.read(fcfg)) == 1:

        # lecture des valeurs
        LISTE_PATH_BDD = ast.literal_eval(cfg['server']['LISTE_PATH_BDD'])
        LISTE_FICHIER_INKML = ast.literal_eval(cfg['server']['LISTE_FICHIER_INKML'])
        LISTE_GESTE_BDD = ast.literal_eval(cfg['server']['LISTE_GESTE_BDD'])
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
                     'LISTE_GESTE_BDD': str(LISTE_GESTE_BDD),
                     'METADONNEE': str(METADONNEE)}
    # écriture du fichier modifié
    with open(fcfg, 'w') as file:
        cfg.write(file)

def ajout_fichiers_inkml_in(pathbdd, namebdd):
    """On ajoute les fichiers de présent à ce path BDD."""
    # pylint: disable-msg=global-statement
    p_1 = re.compile(r'.*[.](?=inkml$)[^.]*$')
    liste_fichier_in = {}
    global METADONNEE
    global LISTE_GESTE_BDD
    for path, _, files in walk(pathbdd):
        for filename in files:
            if p_1.match(filename):
                liste_fichier_in[filename] = path+'/'+filename
    if len(liste_fichier_in) != 0:
        LISTE_GESTE_BDD[namebdd] = [] 
        LISTE_FICHIER_INKML[namebdd] = liste_fichier_in
        metadonnes = []
        for file in liste_fichier_in:
            metadonnes.append(get_meta_donnee(file, namebdd))
        METADONNEE[namebdd] = metadonnes
        return True
    return False

def fermer_bdd_inkml(bdd):
    """ferme une bdd """
    global METADONNEE
    global LISTE_FICHIER_INKML
    global LISTE_GESTE_BDD
    global LISTE_PATH_BDD
    del LISTE_PATH_BDD[bdd]
    del METADONNEE[bdd]
    del LISTE_FICHIER_INKML[bdd]
    del LISTE_GESTE_BDD[bdd]

def effacer_metadonnee_bdd(bdd):
    """ferme une bdd """
    global METADONNEE
    global LISTE_FICHIER_INKML
    global LISTE_GESTE_BDD
    del METADONNEE[bdd]
    del LISTE_FICHIER_INKML[bdd]
    del LISTE_GESTE_BDD[bdd]

def get_meta_donnee(filename, bdd):
    # pylint: disable-msg=too-many-locals
    # pylint: disable-msg=too-many-branches
    # pylint: disable-msg=too-many-nested-blocks
    """Contenu du fichier inkml."""
    global LISTE_GESTE_BDD
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
        elif child.tag == "{http://www.w3.org/2003/InkML}unit":
            for children2 in child:
                if children2.tag == "{http://www.w3.org/2003/InkML}annotationXML":
                    if children2.attrib == {'type': 'actions'}:
                        action = {}
                        nb_annotation += 1
                        for children in children2:
                            action[children.attrib['type']] = children.text
                            if(children.attrib['type'] == "type" and children.text not in LISTE_GESTE_BDD[bdd]):
                                LISTE_GESTE_BDD[bdd].append(children.text)
                        annotations[nb_annotation] = action
                    else:
                        ##récupere les annotations non implÃ©menter(autres que capteur,user,action)
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
    donnees = []
    tree = ET.parse(filepath)
    root = tree.getroot()
    for child in root:
        if child.tag == "{http://www.w3.org/2003/InkML}traceGroup":
            for children in child:
                if children.tag == "{http://www.w3.org/2003/InkML}trace":
                    dict_final = []
                    dict_1 = children.text.split(", ")
                    for point in dict_1:
                        tab_2 = point.split(" ")
                        dict_final.append(tab_2)
                    donnees.append(dict_final)
    return donnees

#############Exploration route :##############

@APP.route('/models/getMetaDonnee')
def route_get_meta_donne():
    """Permet de télécharger l'ensemble des méta_donnée"""

    return json.dumps(METADONNEE)

@APP.route('/models/getListBDD')
def route_get_list_bdd():
    """Permet de télécharger la liste des BDD"""
    print(list(LISTE_PATH_BDD))
    return json.dumps(list(LISTE_PATH_BDD.keys()))

#cette route permet de recuperer les données normalisées du fichier namefichier
@APP.route('/models/getDonnee/<bdd>/<namefichier>')
def route_get_sequence(bdd, namefichier):
    """Permet de télécharger donnée a partir du nom de fichier """
    if bdd in LISTE_PATH_BDD:
        if namefichier in LISTE_FICHIER_INKML[bdd]:
            return json.dumps(get_donnee(namefichier, bdd))
    return None

@APP.route('/models/addBDD')
def route_add_bdd():
    """add new path ddb"""
    global LISTE_PATH_BDD
    global LISTE_GESTE_BDD
    root = tkinter.Tk()
    root.withdraw()
    top = tkinter.Toplevel(root)
    top.withdraw()
    root.update()
    top.update()
    try:
        path = tkinter.filedialog.askdirectory(mustexist=True)
        #Permet de télécharger donnée a partir du nom de fichier
        if path != "":
            p_2 = re.compile(r'[^/]*$')
            namebdd = p_2.search(path)
            if namebdd is not None:
                namebdd = namebdd.group(0)
                if namebdd not in LISTE_PATH_BDD:
                    if ajout_fichiers_inkml_in(path, namebdd):
                        LISTE_PATH_BDD[namebdd] = path
                        LISTE_GESTE_BDD[namebdd] = []
                        save_config()
        root.destroy()
        return json.dumps(METADONNEE)
    except RuntimeError:
        print("tkinter bug")
        root.destroy()
        return json.dumps(METADONNEE)

@APP.route('/models/addBDDwithpath/<path>')
def route_add_bdd_path(path):
    """add new path ddb"""
    global LISTE_PATH_BDD
    global LISTE_GESTE_BDD
    strpath = ""
    for char in path.split(','):
        strpath += chr(int(char))
    if strpath != "":
        p_2 = re.compile(r'[^/]*$')
        namebdd = p_2.search(strpath)
        if namebdd is not None:
            namebdd = namebdd.group(0)
            if namebdd not in LISTE_PATH_BDD:
                if ajout_fichiers_inkml_in(strpath, namebdd):
                    LISTE_PATH_BDD[namebdd] = strpath
                    LISTE_GESTE_BDD[namebdd] = []
                    save_config()
    return json.dumps(METADONNEE)


@APP.route('/models/closeBDD/<name>')
def route_close_bdd(name):
    """Permet de fermer une base donnée"""
    global LISTE_PATH_BDD
    p_2 = re.compile(r'[^/]*$')
    namebdd = p_2.search(name)
    if namebdd is not None:
        namebdd = namebdd.group(0)
        if namebdd in LISTE_PATH_BDD:
            fermer_bdd_inkml(namebdd)
    save_config()
    return METADONNEE

@APP.route('/models/reload/<name>')
def route_reload_bdd(name):
    """Permet de télécharger donnée a partir du nom de fichier """
    global LISTE_FICHIER_INKML
    global METADONNEE
    if name in LISTE_PATH_BDD:
        effacer_metadonnee_bdd(name)
        ajout_fichiers_inkml_in(LISTE_PATH_BDD[name], name)
    save_config()
    print(LISTE_GESTE_BDD)
    return METADONNEE

#############Traduire Fichier INKML -> TXT route :##############

if __name__ == "__main__":
    get_last_config()
    download_hyperparameters()
    start_wandb_v2()
    #download_weights("je7bvwl4")
    #start_learning('mo6')
    APP.run(host='0.0.0.0')
    save_config()


#    F = open("donneeSample.txt", "w")
#    F.write(str(get_donnee("Sample00001_data.inkml", "BDD_chalearn_inkml")))
#    F.close()

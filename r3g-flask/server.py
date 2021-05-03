# -*- coding: utf-8 -*-
# pylint: disable=E1101
# pylint: disable=R0914
# pylint: disable=R1702
# pylint: disable=C0301
"""Programme permettant de faire tourner le serveur utilise par R3G."""

import os
import json
import subprocess
import sys
import configparser
import ast
import tkinter.filedialog
import shutil

from os import walk
import re
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import SubElement
from xml.dom.minidom import parseString
from shutil import copyfile
from flask import Flask, request, flash, redirect
import wandb
from werkzeug.utils import secure_filename
import matplotlib.cm as cm
from Class.Hyperparameters import Hyperparameters
from Class.Model import Model
from Class.Annotation import Annotation
from Class.Eval import Eval
from Class.Poids import Poids
from Model.ModelEarlyOC3D_3D import ModelEarlyOC3D_3D


APP = Flask(__name__)
API = wandb.Api()
RUNS = API.runs("precoce3d-OC3D")
MODEL_LIST = []
CLASSES = []
EVALUATION = []
LISTE_PATH_BDD = {}
LISTE_FICHIER_INKML = {}
LISTE_GESTE_BDD = {}
LISTE_GESTE_BDD_ACTION = {}
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


def get_class_geste(name):
    """ on recup le contenu de tab_class.txt """
    if os.path.exists('./'+name+'/Actions.csv'):
        with open('./'+name+'/Actions.csv') as file_content:
            for line in file_content:
                CLASSES.append(line.split(';')[1].replace('\n', ''))


def delete_eval():
    """supression des anciennes eval """
    if not os.path.exists('./EvaluationSequences'):
        os.mkdir('./EvaluationSequences')
    for fichier in os.listdir('./EvaluationSequences'):
        if os.path.exists('./EvaluationSequences/'+fichier):
            os.remove('./EvaluationSequences/'+fichier)

def load_config(path_model) -> dict:
    # pylint: disable-msg=eval-used
    """ recup de fichier de config """
    with open(path_model + "config.txt", "r") as finfo:
        infos = eval("\n".join(finfo.readlines()))
        finfo.close()
    return infos


@APP.route('/models/getGesteZero/<name_bdd>')
def get_geste_zero(name_bdd):
    """ on recup le geste identifié par 0 dans la bdd"""
    if os.path.exists(LISTE_PATH_BDD[name_bdd]+'/Actions.csv'):
        with open(LISTE_PATH_BDD[name_bdd]+'/Actions.csv') as file_content:
            for line in file_content:
                if line.split(';')[0] == '0':
                    return json.dumps(line.split(';')[1].replace('\n', ''))
    return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

@APP.route('/models/getPoids/<id_model>')
def get_poids(id_model):
    # pylint: disable=E1101
    """ a utiliser avec tensorflow pour recup les poids du model """
    cmap = cm.jet
    path_model = "Weigths/"+id_model+'/weights/'
    download_weights(id_model)
    config = load_config(path_model)
    model = ModelEarlyOC3D_3D(nbClass=config["nbClass"], boxSize=config["boxSize"],
                          doGLU=config["doGlu"], dropoutVal=config["dropoutVal"],
                          denseNeurones=config["denseSize"],
                          denseDropout=config["denseDropout"], nbFeatureMap=config["nbFeatureMap"],
                          dilatationsRates=config["dilatationRates"],
                          maxPoolSpatial=config["maxPoolSpatial"],
                          poolSize=config["poolSize"], poolStrides=config["poolSize"])
    model.load_weights(path_model + "Weights/model")
    model.build((None,None,config["boxSize"][0],config["boxSize"][1],config["boxSize"][2]))
    llist = []
    for elt in model.layersConv:
        name = elt.name
        biais = elt.get_weights()[1].tolist()
        outgoing_channels = len(biais)
        for i in range(outgoing_channels):
            filtre = elt.get_weights()[0]
            filtre = filtre[:, :, :, :, i]
            filtre = cmap(filtre)*255
            filtre = filtre.tolist()
            llist.append(Poids(name, filtre, biais, i).__dict__)
    return json.dumps(llist)


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


@APP.route('/models/evaluation/<name>/<sequences>/<model>')
def evaluation(name, sequences, model):
    """ on fait l'evaluation de sequences avec le model passé en param"""
    global CLASSES
    download_weights(model)
    CLASSES = LISTE_GESTE_BDD_ACTION[name]
    pathbdd = LISTE_PATH_BDD[name]
    seq = sequences.split(',')
    if len(CLASSES) == 0:
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

   # remise à zéro des séquences à évaluer
    if not os.path.exists('./Sequences'):
        os.mkdir('./Sequences')
    for fichier in os.listdir('./Sequences'):
        if os.path.exists('./Sequences/'+fichier):
            os.remove('./Sequences/'+fichier)


    # run SequenceEvaluator.py pour évaluer
    file_to_convert = {}
    for iid,elt in enumerate(seq):
        if not os.path.exists(pathbdd + '/Data/' + elt.replace('inkml','txt')):
            file_to_convert[iid]= pathbdd + '/Inkml/' + elt

    write_data(file_to_convert, pathbdd)

    for elt in seq:
        copyfile(pathbdd + '/Data/' + elt.replace('.inkml', '') + '.txt', './Sequences/' + \
        elt.replace('.inkml', '') + '.txt')

    subprocess.call([sys.executable, "SequenceEvaluator.py", "Sequences/", "EvaluationSequences/"\
    + model, "Weigths/"+model+'/weights/'])


    for file in os.listdir('./EvaluationSequences/'):
        liste_annotation = []
        with open('./EvaluationSequences/' + file) as file_content:
            for line in file_content:
                tab = line.split(',')
                id_geste = int(tab[0])
                debut = int(tab[1])
                fin = int(tab[2])
                annotation = Annotation(debut, fin, 0, CLASSES[id_geste])
                liste_annotation.append(annotation.__dict__)
        EVALUATION.append(Eval(file.replace('txt', 'inkml').replace(model, ''),\
        liste_annotation, model).__dict__)

    return json.dumps(EVALUATION)


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


@APP.route('/models/getDonneeVoxel/<bdd>/<namefichier>')
def route_get_donnee_voxel(bdd, namefichier):
    """Permet de télécharger donnée a partir du nom de fichier """
    if bdd in LISTE_PATH_BDD:
        if namefichier in LISTE_FICHIER_INKML[bdd]:
            filepath = (LISTE_PATH_BDD[bdd]+ '/' + 'Voxelized/' +
                        namefichier.split('/')[len(namefichier.split('/'))-1][:-5] + 'txt')
            if os.path.isfile(filepath):
                with open(filepath, 'r') as file:
                    lines = file.readlines()
                    dim = list(map(int, lines[0].split(',')))
                    boxes = []
                    for xit in range(1, len(lines), dim[1]*dim[0]):
                        list3d = []
                        for yit in range(0, dim[1]*dim[0], dim[1]):
                            list2d = []
                            for zit in range(0, dim[1], 1):
                                list2d.append(list(map(float, lines[xit+yit+zit].split(','))))
                            list3d.append(list2d)
                        boxes.append(list3d)
                    file.close()
                return json.dumps(boxes)
    return json.dumps('Failed')

#############Annotation route :##############
@APP.route('/models/saveAnnot/<bdd>/<namefichier>/<annotationsstr>')
def route_save_annot(bdd, namefichier, annotationsstr):
    # pylint: disable-msg=too-many-branches
    # pylint: disable-msg=too-many-statements
    """Permet de sauvegarder les annotations de cette sequence"""
    annotations = json.loads(annotationsstr)
    listsuprimer = []
    if bdd in LISTE_PATH_BDD:
        if namefichier in LISTE_FICHIER_INKML[bdd]:
            filepath = LISTE_PATH_BDD[bdd]+ '/Inkml/' + namefichier
            ET.register_namespace('', "http://www.w3.org/2003/InkML")
            tree = ET.parse(filepath)
            root = tree.getroot()
            if root.find("{http://www.w3.org/2003/InkML}unit") is not None:
                for child in root:
                    if child.tag == "{http://www.w3.org/2003/InkML}unit":
                        for children2 in child:
                            if children2.tag == "{http://www.w3.org/2003/InkML}annotationXML":
                                if children2.attrib == {'type': 'actions'}:
                                    listsuprimer.append(children2)
                for child in root:
                    if child.tag == "{http://www.w3.org/2003/InkML}unit":
                        for elem in listsuprimer:
                            if elem in child:
                                child.remove(elem)
                for child in root:
                    if child.tag == "{http://www.w3.org/2003/InkML}unit":
                        for annot in annotations:
                            annotation_xml = SubElement(child, 'annotationXML')
                            annotation_xml.set('type', 'actions')
                            annotation = SubElement(annotation_xml, 'annotation')
                            annotation.set('type', 'type')
                            annotation.text = annot['classeGeste']
                            annotation = SubElement(annotation_xml, 'annotation')
                            annotation.set('type', 'start')
                            annotation.text = str(annot['f1'])
                            annotation = SubElement(annotation_xml, 'annotation')
                            annotation.set('type', 'end')
                            annotation.text = str(annot['f2'])
                            if annot['pointAction'] != 0:
                                annotation = SubElement(annotation_xml, 'annotation')
                                annotation.set('type', 'ActionPoint')
                                annotation.text = str(annot['pointAction'])
            else:
                counter = 0
                for child in root:
                    if child.attrib != "{http://www.w3.org/2003/InkML}traceGroup":
                        if child.attrib != "{http://www.w3.org/2003/InkML}annotationXML" or child.attrib != {'type': 'directive'}:
                            counter = counter + 1
                annotation_unit = ET.Element('unit')
                root.insert(counter - 2, annotation_unit)
                for annot in annotations:
                    annotation_xml = SubElement(annotation_unit, 'annotationXML')
                    annotation_xml.set('type', 'actions')
                    annotation = SubElement(annotation_xml, 'annotation')
                    annotation.set('type', 'type')
                    annotation.text = annot['classeGeste']
                    annotation = SubElement(annotation_xml, 'annotation')
                    annotation.set('type', 'start')
                    annotation.text = str(annot['f1'])
                    annotation = SubElement(annotation_xml, 'annotation')
                    annotation.set('type', 'end')
                    annotation.text = str(annot['f2'])
                    if annot['pointAction'] != 0:
                        annotation = SubElement(annotation_xml, 'annotation')
                        annotation.set('type', 'ActionPoint')
                        annotation.text = str(annot['pointAction'])
            _pretty_print(root)
            tree = ET.ElementTree(root)
            tree.write(filepath, encoding="UTF-8", xml_declaration=True)
            tree = ET.ElementTree(root)
            return json.dumps('saved')
    return None

def _pretty_print(current, parent=None, index=-1, depth=0):
    for i, node in enumerate(current):
        _pretty_print(node, current, i, depth + 1)
    if parent is not None:
        if index == 0:
            parent.text = '\n' + ('\t' * depth)
        else:
            parent[index - 1].tail = '\n' + ('\t' * depth)
        if index == len(parent) - 1:
            current.tail = '\n' + ('\t' * (depth - 1))
#############Exploration methode##############

def get_last_config():
    """lire les dernière variables enregistrer pour recharger
    la même configuration si un fichier Config_Server existe"""
     # lecture du fichier
    global LISTE_PATH_BDD
    global LISTE_FICHIER_INKML
    global METADONNEE
    global LISTE_GESTE_BDD
    global LISTE_GESTE_BDD_ACTION

    fcfg = 'config.ini'
    cfg = configparser.ConfigParser()

    if len(cfg.read(fcfg)) == 1:
        # lecture des valeurs
        LISTE_PATH_BDD = ast.literal_eval(cfg['server']['LISTE_PATH_BDD'])
        LISTE_FICHIER_INKML = ast.literal_eval(cfg['server']['LISTE_FICHIER_INKML'])
        LISTE_GESTE_BDD = ast.literal_eval(cfg['server']['LISTE_GESTE_BDD'])
        LISTE_GESTE_BDD_ACTION = ast.literal_eval(cfg['server']['LISTE_GESTE_BDD_ACTION'])
        METADONNEE = ast.literal_eval(cfg['server']['METADONNEE'])

def save_config():
    """sauvegarde des dernieres valeurs lues"""
    fcfg = 'config.ini'
    cfg = configparser.ConfigParser()
    # modification des valeurs
    cfg['server'] = {'LISTE_PATH_BDD': str(LISTE_PATH_BDD),
                     'LISTE_FICHIER_INKML': str(LISTE_FICHIER_INKML),
                     'LISTE_GESTE_BDD': str(LISTE_GESTE_BDD),
                     'LISTE_GESTE_BDD_ACTION': str(LISTE_GESTE_BDD_ACTION),
                     'METADONNEE': str(METADONNEE)}
    # écriture du fichier modifié
    with open(fcfg, 'w') as file:
        cfg.write(file)

def ajout_fichiers_inkml_in(pathbdd, namebdd):
    """On ajoute les fichiers de présent à ce path BDD."""
    # pylint: disable-msg=global-statement
    p_1 = re.compile(r'.*[.](?=inkml$)[^.]*$')
    liste_fichier_in = {}
    longeur_path = len(pathbdd)
    global METADONNEE
    global LISTE_GESTE_BDD
    global LISTE_GESTE_BDD_ACTION
    for path, _, files in walk(pathbdd):
        for filename in files:
            if p_1.match(filename):
                liste_fichier_in[filename] = path[longeur_path:]+'/'+filename
    if len(liste_fichier_in) != 0:
        LISTE_GESTE_BDD[namebdd] = []
        LISTE_FICHIER_INKML[namebdd] = liste_fichier_in
        rechercher_action_csv(pathbdd, namebdd)
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
    global LISTE_GESTE_BDD_ACTION
    del LISTE_PATH_BDD[bdd]
    del METADONNEE[bdd]
    del LISTE_FICHIER_INKML[bdd]
    del LISTE_GESTE_BDD[bdd]
    del LISTE_GESTE_BDD_ACTION[bdd]

def effacer_metadonnee_bdd(bdd):
    """ferme une bdd """
    global METADONNEE
    global LISTE_FICHIER_INKML
    global LISTE_GESTE_BDD
    global LISTE_GESTE_BDD_ACTION
    del METADONNEE[bdd]
    del LISTE_FICHIER_INKML[bdd]
    del LISTE_GESTE_BDD[bdd]
    del LISTE_GESTE_BDD_ACTION[bdd]

def get_meta_donnee(filename, bdd):
    # pylint: disable-msg=too-many-locals
    # pylint: disable-msg=too-many-branches
    # pylint: disable-msg=too-many-nested-blocks
    """Contenu du fichier inkml."""
    global LISTE_GESTE_BDD
    filepath = LISTE_PATH_BDD[bdd] + LISTE_FICHIER_INKML[bdd][filename]
    name = filename
    format_donnee = {}
    annotations = {}
    directives = []
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
                            if(children.attrib['type'] == "type" and children.text \
                            not in LISTE_GESTE_BDD[bdd]):
                                LISTE_GESTE_BDD[bdd].append(children.text)
                        annotations[nb_annotation] = action
        elif child.tag == "{http://www.w3.org/2003/InkML}annotationXML":
            ##récupere les annotations non implÃ©menter(autres que capteur,user,action)
            if child.attrib == {'type': 'directive'}:
                for children2 in child:
                    if (children2.tag == "{http://www.w3.org/2003/InkML}annotation" and
                            children2.attrib == {'type': 'gesture'}):
                        directives.append(children2.text)
            else:
                other = {}
                nb_others += 1
                for children in child:
                    other[children.attrib['type']] = children.text
                others[child.attrib['type']] = other
        elif child.tag == "{http://www.w3.org/2003/InkML}traceGroup":
            break
    metadonnee = {"id": name, "BDD": bdd, "format": format_donnee,
                  "annotation": annotations, "directives": directives, "metadonnees": others}
    return metadonnee

def get_donnee(filename, bdd):
    """Contenu du fichier inkml."""
    filepath = LISTE_FICHIER_INKML[bdd][filename]
    donnees = []
    tree = ET.parse(LISTE_PATH_BDD[bdd]+ '/' + filepath)
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

def rechercher_action_csv(strpath, name):
    """telecharger la liste des geste de Action.csv"""
    global LISTE_GESTE_BDD_ACTION
    tabclass = []
    filepath = os.path.join(strpath, 'Actions.csv')
    if os.path.isfile(filepath):
        with open(filepath, 'r') as fileclass:
            for line in fileclass:
                line = line.replace('\n', '')
                tabtemp = line.split(';')
                tabclass.append(tabtemp[1])
            fileclass.close()
    LISTE_GESTE_BDD_ACTION[name] = tabclass

def ajouter_class_actioncsv(bdd, name_action):
    """ajout a la fin du ficheier Action.csv un nouveau geste"""
    global LISTE_GESTE_BDD_ACTION
    LISTE_GESTE_BDD_ACTION[bdd].append(name_action)
    filepath = os.path.join(LISTE_PATH_BDD[bdd], 'Actions.csv')
    nb_geste = -1
    if os.path.isfile(filepath):
        with open(filepath, 'r') as fileclass:
            nb_geste = len(fileclass.readlines())
            fileclass.close()
        if nb_geste != -1:
            with open(filepath, 'a') as fileclass:
                fileclass.write(str(nb_geste) + ";" + name_action)
                fileclass.close()

def add_listgeste_metadonne():
    """Construit la structure a envoyer au serveur contenant
    et les liste de geste par bdd et les Metadonnee"""
    return [LISTE_GESTE_BDD, LISTE_GESTE_BDD_ACTION, METADONNEE]

def add_listgeste_metadonnee_one(name):
    """Construit la structure a envoyer au serveur contenant
    et les liste de geste pour une bdd et ses Metadonnee"""
    return [LISTE_GESTE_BDD[name], LISTE_GESTE_BDD_ACTION[name], METADONNEE[name]]

def add_listgeste_metadonnee_one_and_name(name):
    """Construit la structure a envoyer au serveur contenant
    et les liste de geste pour une bdd et ses Metadonnee"""
    return [name, LISTE_GESTE_BDD[name], LISTE_GESTE_BDD_ACTION[name], METADONNEE[name]]
#############Exploration route :##############


@APP.route('/models/ajoutClass/<bdd>/<action>')
def route_ajouter_class_actioncsv(bdd, action):
    """ajoute au fichier Actions csv la nouvelle classe de geste"""
    ajouter_class_actioncsv(bdd, action)
    return json.dumps(LISTE_GESTE_BDD_ACTION[bdd])

@APP.route('/models/getMetaDonnee')
def route_get_meta_donne():
    """Permet de télécharger l'ensemble des méta_donnée"""
    return json.dumps(add_listgeste_metadonne())

@APP.route('/models/getListBDD')
def route_get_list_bdd():
    """Permet de télécharger la liste des BDD"""
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
    global LISTE_GESTE_BDD_ACTION
    root = tkinter.Tk()
    root.withdraw()
    top = tkinter.Toplevel(root)
    top.withdraw()
    root.update()
    top.update()
    namebdd = ""
    try:
        path = tkinter.filedialog.askdirectory(mustexist=True)
        #Permet de télécharger donnée a partir du nom de fichier
        p_2 = re.compile(r'[^/]*$')
        namebdd = p_2.search(path)
        namebdd = namebdd.group(0)
        if len(namebdd) > 0:
            if namebdd not in LISTE_PATH_BDD:
                LISTE_GESTE_BDD[namebdd] = []
                LISTE_PATH_BDD[namebdd] = path
                LISTE_GESTE_BDD_ACTION[namebdd] = []
                if ajout_fichiers_inkml_in(path, namebdd):
                    rechercher_action_csv(path, namebdd)
                    save_config()
                else:
                    del LISTE_GESTE_BDD[namebdd]
                    del LISTE_PATH_BDD[namebdd]
                    del LISTE_GESTE_BDD_ACTION[namebdd]
                root.destroy()
                return json.dumps(add_listgeste_metadonnee_one_and_name(namebdd))
        root.destroy()
        return json.dumps('directory not found')
    except RuntimeError:
        root.destroy()
        return json.dumps("Erreur")

@APP.route('/models/addBDDwithpath/<path>')
def route_add_bdd_path(path):
    """add new path ddb"""
    global LISTE_PATH_BDD
    global LISTE_GESTE_BDD
    global LISTE_GESTE_BDD_ACTION
    strpath = ""
    for char in path.split(','):
        strpath += chr(int(char))
    if strpath != "":
        namebdd = os.path.basename(strpath)
        if namebdd not in LISTE_PATH_BDD:
            LISTE_GESTE_BDD[namebdd] = []
            LISTE_PATH_BDD[namebdd] = strpath
            LISTE_GESTE_BDD_ACTION[namebdd] = []
            if ajout_fichiers_inkml_in(strpath, namebdd):
                rechercher_action_csv(strpath, namebdd)
                save_config()
            else:
                del LISTE_GESTE_BDD[namebdd]
                del LISTE_PATH_BDD[namebdd]
                del LISTE_GESTE_BDD_ACTION[namebdd]
            return json.dumps(add_listgeste_metadonnee_one_and_name(namebdd))
    return json.dumps('directory not found or empty')



@APP.route('/models/closeBDD/<name>')
def route_close_bdd(name):
    """Permet de fermer une base donnée"""
    global LISTE_PATH_BDD
    if name in LISTE_PATH_BDD:
        fermer_bdd_inkml(name)
        save_config()
        return json.dumps("Bdd well deleted")
    return json.dumps("Bdd doesn't exist")

@APP.route('/models/reload/<name>')
def route_reload_bdd(name):
    """Permet de télécharger donnée a partir du nom de fichier """
    if name in LISTE_PATH_BDD:
        effacer_metadonnee_bdd(name)
        ajout_fichiers_inkml_in(LISTE_PATH_BDD[name], name)
    save_config()
    return json.dumps(add_listgeste_metadonnee_one(name))

#############Route CREER Base de Donnée inkml depuis txt :##############

@APP.route('/models/txtToInkml/<labels_path_dossier>'+
           '/<data_path_dossier>/<inkml_path_dossier>/<fps>/<path_class>')
def route_add_bdd_path_txt(labels_path_dossier, data_path_dossier,
                           inkml_path_dossier, fps, path_class):
    """add new path ddb and translate it to inkml"""
    path_class_tr = ""
    for char in path_class.split(','):
        path_class_tr += chr(int(char))
    data_path_dossier_tr = ""
    for char in data_path_dossier.split(','):
        data_path_dossier_tr += chr(int(char))
    labels_path_dossier_tr = ""
    for char in labels_path_dossier.split(','):
        labels_path_dossier_tr += chr(int(char))
    inkml_path_dossier_tr = ""
    for char in inkml_path_dossier.split(','):
        inkml_path_dossier_tr += chr(int(char))
    fps_tr = int(fps)
    path_class_tr = os.path.join(path_class_tr, 'Actions.csv')

    tab_class = read_class(path_class_tr)
    liste_data = rechercher_fichier_data(data_path_dossier_tr)
    liste_label = rechercher_fichier_label(labels_path_dossier_tr)
    copy_file_tabclass_to_inkml(inkml_path_dossier_tr, path_class_tr)
    generate_database(liste_data, liste_label, tab_class, inkml_path_dossier_tr, fps_tr)
    return json.dumps("worked")
#############fonction BDD TXT vers INKML##############
def generate_template():
    """On genere un template"""
    root = ET.Element('ink', {"xmlns":"http://www.w3.org/2003/InkML"})
    trace_format = SubElement(root, 'traceFormat')
    SubElement(trace_format, 'channel', {"name":"x", "type":"Decimal"})
    SubElement(trace_format, 'channel', {"name":"y", "type":"Decimal"})
    SubElement(trace_format, 'channel', {"name":"z", "type":"Decimal"})
    SubElement(trace_format, 'channel', {"name":"timestamp", "type":"Decimal"})
    return ET.ElementTree(root)

def add_labels(inkmltree, labels, dictclass):
    """on ajoute les annotations a l'arbre passe en param"""
    root = inkmltree.getroot()
    with open(labels, 'r') as filelabels:
        unit = SubElement(root, 'unit')
        for line in filelabels:
            label = line[:-1].split(',')
            annotation_xml = SubElement(unit, 'annotationXML')
            annotation_xml.set('type', 'actions')
            annotation = SubElement(annotation_xml, 'annotation')
            annotation.set('type', 'type')
            annotation.text = dictclass[label[0]]
            annotation = SubElement(annotation_xml, 'annotation')
            annotation.set('type', 'start')
            annotation.text = label[1]
            annotation = SubElement(annotation_xml, 'annotation')
            annotation.set('type', 'end')
            annotation.text = label[2]
        filelabels.close()

def add_data(inkmltree, data, fps):
    """ajout des donnees a l'arbre inkml"""
    root = inkmltree.getroot()
    with open(data, 'r') as filedata:
        timestamp = 0
        traces = {}
        tracegroup = SubElement(root, 'traceGroup')
        for line in filedata:
            positions = line[:-1].split(' ')
            for i in range(int(len(positions) / 3)):
                traces.setdefault(str(i), [])
                traces[str(i)] += [[positions[3 * i],
                                    positions[3 * i + 1], positions[3 * i + 2],
                                    str(timestamp)]]
            timestamp += 1 / fps
        for articulation in traces:
            trace = SubElement(tracegroup, 'trace')
            trace.text = ''
            for tab in traces[articulation]:
                for elem in tab:
                    trace.text = str(trace.text) + str(elem) + ' '
                trace.text = trace.text[:-1] + ', '
            trace.text = trace.text[:-2]
        filedata.close()

def read_class(pathclass):
    """lecture tableau correspondance de classe"""
    dictclass = {}
    with open(pathclass, 'r') as fileclass:
        for line in fileclass:
            line = line.replace('\n', '')
            tabtemp = line.split(';')
            dictclass[tabtemp[0]] = tabtemp[1]
        fileclass.close()
    return dictclass

def generatefile_inkml_with_label(data, label, tableau_classe, inkml_file, fps):
    """construit le fichier inkml avec annotation"""
    inkml_tree = generate_template()
    add_labels(inkml_tree, label, tableau_classe)
    add_data(inkml_tree, data, fps)
    inkml_tree.write(inkml_file, encoding="UTF-8", xml_declaration=True)
# utile seulement si inkml pas indenté
    with open(inkml_file, "r") as file:
        parser = parseString(file.read())
        file.close()
    with open(inkml_file, "w") as file:
        file.write(parser.toprettyxml())
        file.close()

def generatefile_inkml(data, inkml_file, fps):
    """construit le fichier inkml sans annotation"""
    inkml_tree = generate_template()
    add_data(inkml_tree, data, fps)
    inkml_tree.write(inkml_file, encoding="UTF-8", xml_declaration=True)
# utile seulement si inkml pas indenté
    with open(inkml_file, "r") as file:
        parser = parseString(file.read())
        file.close()
    with open(inkml_file, "w") as file:
        file.write(parser.toprettyxml())
        file.close()

def rechercher_fichier_data(path_dossier_data):
    """recherche dans le repertoir des fichier contenant de la data"""
    liste_fichier_data = {}
    p_1 = re.compile(r'.*[.](?=txt$)[^.]*$')
    for path, _, files in walk(path_dossier_data):
        for filename in files:
            if p_1.match(filename):
                liste_fichier_data[filename] = path+'/'+filename
    return liste_fichier_data

def rechercher_fichier_label(path_dossier_label):
    """recherche du fichier label"""
    liste_fichier_label = {}
    p_1 = re.compile(r'.*[.](?=txt$)[^.]*$')
    for path, _, files in walk(path_dossier_label):
        for filename in files:
            if p_1.match(filename):
                liste_fichier_label[filename] = path+'/'+filename
    return liste_fichier_label

def generate_database(liste_data, liste_label, tableau_classe, inkml_path_dossier, fps):
    """construit l'ensemble de la base de donnée inkml"""
    os.makedirs(os.path.join(inkml_path_dossier, 'Inkml'), exist_ok=True)
    for file_data in liste_data:
        if file_data in liste_label:
            generatefile_inkml_with_label(liste_data[file_data],
                                          liste_label[file_data], tableau_classe,
                                          inkml_path_dossier + "/Inkml/" + file_data[:-3] + "inkml",
                                          fps)
        else:
            generatefile_inkml(liste_data[file_data],
                               inkml_path_dossier + "/Inkml/" + file_data[:-3] + "inkml", fps)
def copy_file_tabclass_to_inkml(inkml_path_dossier, path_class):
    """copier et renommer le fichier tabclass"""
    shutil.copy(path_class, os.path.join(inkml_path_dossier, 'Actions.csv'))

#############Route CREER Base de Donnée txt depuis inkml :##############
@APP.route('/models/inkmlToTxt/<bddname>'+
           '/<txt_path_dossier>')
def route_inkml_to_txt(bddname, txt_path_dossier):
    """add new path ddb and translate it to inkml"""
    inkml_path_dossier_tr = LISTE_PATH_BDD[bddname]
    txt_path_dossier_tr = ""
    for char in txt_path_dossier.split(','):
        txt_path_dossier_tr += chr(int(char))
    txt_path_dossier_tr = os.path.join(txt_path_dossier_tr, bddname)
    os.makedirs(txt_path_dossier_tr)
    path_class_tr = os.path.join(inkml_path_dossier_tr, "Actions.csv")
    liste_inkml = rechercher_fichier_inkml(inkml_path_dossier_tr)
    write_labels(liste_inkml, txt_path_dossier_tr, path_class_tr)
    write_data(liste_inkml, txt_path_dossier_tr)
    copy_file_tabclass_to_txt(path_class_tr, txt_path_dossier_tr)
    return json.dumps("worked")

#############Fonctions CREER Base de Donnée txt depuis inkml :##############
def rechercher_fichier_inkml(inkml_path_dossier):
    """On ajoute les fichiers de présent à ce path BDD."""
    # pylint: disable-msg=global-statement
    p_1 = re.compile(r'.*[.](?=inkml$)[^.]*$')
    liste_fichier_in = {}
    for path, _, files in walk(inkml_path_dossier):
        for filename in files:
            if p_1.match(filename):
                liste_fichier_in[filename] = path +'/'+filename
    return liste_fichier_in

def write_labels(liste_inkml, path_txt, path_class):
    """ajout des annotations au fichier labeltxt"""
    dictclass = {}
    with open(path_class) as fileclass:
        for line in fileclass:
            tabtemp = line.replace('\n', '').split(';')
            dictclass[tabtemp[1]] = tabtemp[0]
    for key in liste_inkml:
        annotations = {}
        nb_annotation = 0
        file = liste_inkml[key]
        for child in ET.parse(file).getroot():
            if child.tag == "{http://www.w3.org/2003/InkML}unit":
                for children in child:
                    if (children.tag == "{http://www.w3.org/2003/InkML}annotationXML" and
                            children.attrib == {'type': 'actions'}):
                        action = {}
                        nb_annotation += 1
                        for children2 in children:
                            action[children2.attrib['type']] = children2.text
                        annotations[nb_annotation] = action
            elif child.tag == "{http://www.w3.org/2003/InkML}traceGroup":
                break
        filename = os.path.join(path_txt, "Label",
                                os.path.splitext(os.path.basename(file))[0] + ".txt")
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, "w") as flabel:
            if len(annotations) > 0:
                for id_elem in annotations:
                    line = ""
                    line += dictclass[annotations[id_elem]["type"]]
                    line += ","
                    line += annotations[id_elem]["start"]
                    line += ","
                    line += annotations[id_elem]["end"]
                    flabel.write(line + "\n")
            flabel.close()

def write_data(liste_inkml, path_txt):
    """ajout des donnees au fichier datatxt"""
    for key in liste_inkml:
        file = liste_inkml[key]
        nb_articulations = 0
        donnees = {}
        string = ""
        for child in ET.parse(file).getroot():
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
        filename = os.path.join(path_txt, "Data",
                                os.path.splitext(os.path.basename(file))[0] + ".txt")
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, "w") as fdata:
            for id_elem in range(len(donnees[0])):
                string = ""
                for articulation in donnees:
                    ## -1 sur len car on ne veut pas lire le timestamp
                    for point in range(len(donnees[articulation][id_elem]) - 1):
                        string += donnees[articulation][id_elem][point] + " "
                fdata.write(string + "\n")
            fdata.close()
def copy_file_tabclass_to_txt(path_tabclass, txt_path_dossier):
    """copier le fichier Actions.csv vers txt"""
    shutil.copy(path_tabclass, txt_path_dossier)

########### MAIN ########################

if __name__ == "__main__":
    get_last_config()
    delete_eval()
    start_wandb_v2()
    APP.run(host='0.0.0.0')
    save_config()


#    F = open("donneeSample.txt", "w")
#    F.write(str(get_donnee("Sample00001_data.inkml", "BDD_chalearn_inkml")))
#    F.close()

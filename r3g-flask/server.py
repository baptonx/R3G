# -*- coding: utf-8 -*-
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
    name = name.replace('_inkml', '')
    if os.path.exists('./'+name+'/tabclass.txt'):
        with open('./'+name+'/tabclass.txt') as file_content:
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
    finfo = open(path_model + "config.txt", "r")
    infos = eval("\n".join(finfo.readlines()))
    finfo.close()
    return infos

@APP.route('/models/getPoids/<id_model>/<number>')
def get_poids(id_model, number):
    """ a utiliser avec tensorflow pour recup les poids du model """
    path_model = "Weigths/"+id_model+'/weights/'
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
    filtre = model.layersConv[int(number)].get_weights()[0].tolist()
    biais = model.layersConv[int(number)].get_weights()[1].tolist()
    return json.dumps(Poids(filtre, biais).__dict__)


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
    download_weights(model)
    name = name.replace('_inkml', '')
    get_class_geste(name)
    seq = sequences.split(',')
    if len(CLASSES) == 0:
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

   # remise à zéro des séquences à évaluer
    for fichier in os.listdir('./Sequences'):
        if os.path.exists('./Sequences/'+fichier):
            os.remove('./Sequences/'+fichier)


    # run SequenceEvaluator.py pour évaluer
    for elt in seq:
        copyfile('./' + name + '/Data/' + elt.replace('.inkml', '') + '.txt', './Sequences/' + \
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
    longeur_path = len(pathbdd)
    global METADONNEE
    global LISTE_GESTE_BDD
    for path, _, files in walk(pathbdd):
        for filename in files:
            if p_1.match(filename):
                liste_fichier_in[filename] = path[longeur_path:]+'/'+filename
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
    filepath = LISTE_PATH_BDD[bdd] + LISTE_FICHIER_INKML[bdd][filename]
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
                            if(children.attrib['type'] == "type" and children.text \
                            not in LISTE_GESTE_BDD[bdd]):
                                LISTE_GESTE_BDD[bdd].append(children.text)
                        annotations[nb_annotation] = action
        elif child.tag == "{http://www.w3.org/2003/InkML}annotationXML":
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

def add_listgeste_metadonne():
    """Construit la structure a envoyer au serveur contenant
    et les liste de geste par bdd et les Metadonnee"""
    return [LISTE_GESTE_BDD, METADONNEE]

def add_listgeste_metadonnee_one(name):
    """Construit la structure a envoyer au serveur contenant
    et les liste de geste pour une bdd et ses Metadonnee"""
    return [LISTE_GESTE_BDD[name], METADONNEE[name]]
#############Exploration route :##############

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
                    LISTE_GESTE_BDD[namebdd] = []
                    LISTE_PATH_BDD[namebdd] = path
                    if ajout_fichiers_inkml_in(path, namebdd):
                        save_config()
                    else:
                        del LISTE_GESTE_BDD[namebdd]
                        del LISTE_PATH_BDD[namebdd]
        root.destroy()
        return json.dumps(add_listgeste_metadonne())
    except RuntimeError:
        root.destroy()
        return json.dumps(add_listgeste_metadonne())

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
                LISTE_GESTE_BDD[namebdd] = []
                LISTE_PATH_BDD[namebdd] = strpath
                if ajout_fichiers_inkml_in(strpath, namebdd):
                    save_config()
                else:
                    del LISTE_GESTE_BDD[namebdd]
                    del LISTE_PATH_BDD[namebdd]
    return json.dumps(add_listgeste_metadonne())


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
            return json.dumps("Bdd well deleted")
    return json.dumps("Bdd doesn't exist")

@APP.route('/models/reload/<name>')
def route_reload_bdd(name):
    """Permet de télécharger donnée a partir du nom de fichier """
    global LISTE_FICHIER_INKML
    global METADONNEE
    if name in LISTE_PATH_BDD:
        effacer_metadonnee_bdd(name)
        ajout_fichiers_inkml_in(LISTE_PATH_BDD[name], name)
    save_config()
    return json.dumps(add_listgeste_metadonnee_one(name))

#############Ajouter Fichier INKML depuis TXT route :##############

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
    print(path_class_tr)
    print(data_path_dossier_tr)
    print(labels_path_dossier_tr)
    print(inkml_path_dossier_tr)
    print(fps)
    tab_class = read_class(path_class_tr)
    liste_data = rechercher_fichier_data(data_path_dossier_tr)
    liste_label = rechercher_fichier_label(labels_path_dossier_tr)
    copy_file_tabclass(inkml_path_dossier_tr, path_class_tr)
    generate_database(liste_data, liste_label, tab_class, inkml_path_dossier_tr, fps_tr)
    return json.dumps("worked")
#############BDD TXT vers INKML##############
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
    filelabels = open(labels, 'r')
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
    filedata = open(data, 'r')
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
    fileclass = open(pathclass, 'r')
    dictclass = {}
    for line in fileclass:
        line = line.replace('\n', '')
        tabtemp = line.split(';')
        dictclass[tabtemp[0]] = tabtemp[1]
    return dictclass

def generatefile_inkml(data, label, tableau_classe, inkml_file, fps):
    """construit le fichier inkml"""
    inkml_tree = generate_template()
    add_labels(inkml_tree, label, tableau_classe)
    add_data(inkml_tree, data, fps)
    file = open(inkml_file, "w")
    inkml_tree.write(inkml_file, encoding="UTF-8", xml_declaration=True)
    file.close()
    file = open(inkml_file, "r")
    parser = parseString(file.read())
    file.close()
    file = open(inkml_file, "w")
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
    for file_data in liste_data:
        generatefile_inkml(liste_data[file_data], liste_label[file_data], tableau_classe,
                           inkml_path_dossier + "/" + file_data[:-3] + "inkml", fps)
def copy_file_tabclass(inkml_path_dossier, path_class):
    """construit l'ensemble de la base de donnée inkml"""
    path_dossier_class = os.path.join(inkml_path_dossier, 'DataClasses')
    os.makedirs(path_dossier_class)
    shutil.move(path_class, path_dossier_class+'/Actions.csv')
    # copier et renommer le fichier tabclass
########### MAIN ########################

if __name__ == "__main__":
    get_last_config()
    delete_eval()
    download_hyperparameters()
    start_wandb_v2()
    APP.run(host='0.0.0.0')
    save_config()


#    F = open("donneeSample.txt", "w")
#    F.write(str(get_donnee("Sample00001_data.inkml", "BDD_chalearn_inkml")))
#    F.close()

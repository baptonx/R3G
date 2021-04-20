"""Convertisseur txt to inkml"""

import sys
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import SubElement
from xml.dom.minidom import parseString
import re
from os import walk

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
        annotation.set('type', 'debut')
        annotation.text = label[1]
        annotation = SubElement(annotation_xml, 'annotation')
        annotation.set('type', 'fin')
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
        line = line.replace('\n','')
        tabtemp = line.split(';')
        dictclass[tabtemp[0]] = tabtemp[1]
    return dictclass

def generatefile_inkml(data, label, tableau_classe, inkml_file, fps):
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
    
def recherche_fichier_data(path_dossier_data):
    liste_fichier_data = {}
    p_1 = re.compile(r'.*[.](?=txt$)[^.]*$')
    for path, _, files in walk(path_dossier_data):
        for filename in files:
            if p_1.match(filename):
                liste_fichier_data[filename] = path+'/'+filename
    return liste_fichier_data
    print("data : ")
    print(liste_fichier_data)

def recherche_fichier_label(path_dossier_label):
    liste_fichier_label = {}
    p_1 = re.compile(r'.*[.](?=txt$)[^.]*$')
    for path, _, files in walk(path_dossier_label):
        for filename in files:
            if p_1.match(filename):
                liste_fichier_label[filename] = path+'/'+filename
    
    return(liste_fichier_label)

def generate_database(liste_data, liste_label, tableau_classe,inkml_path_dossier, fps):
    for file_data in liste_data:
        generatefile_inkml(liste_data[file_data], liste_label[file_data], tableau_classe,
                           inkml_path_dossier + "/" + file_data[:-3] + "inkml", fps)
        
        
        

""" version dossier par dosssier """
if __name__ == "__main__":
    LABELSPATHDOSSIER = sys.argv[1]
    DATAPATHDOSSIER = sys.argv[2]
    INKMLPATHDOSSIER = sys.argv[3]
    FPS = int(sys.argv[4])
    PATHCLASS = sys.argv[5]
    TABLEAUCLASS = read_class(PATHCLASS)
    LISTE_DATA = recherche_fichier_data(DATAPATHDOSSIER)
    LISTE_LABEL = recherche_fichier_label(LABELSPATHDOSSIER)
    generate_database(LISTE_DATA, LISTE_LABEL, TABLEAUCLASS,INKMLPATHDOSSIER, FPS)
    
    ##BDD_chalearn/Label BDD_chalearn/Data BDD_chalearn_inkml 50  BDD_chalearn/tabclass.txt 
    
""" version fichier par fichier
if __name__ == "__main__":
    LABELSPATH = sys.argv[1]
    DATA = sys.argv[2]
    INKMLFILEPATH = sys.argv[3]
    FPS = int(sys.argv[4])
    PATHCLASS = sys.argv[5]
    INKML_TREE = generate_template()
    TABLEAUCLASS = read_class(PATHCLASS)
    add_labels(INKML_TREE, LABELSPATH, TABLEAUCLASS)
    add_data(INKML_TREE, DATA, FPS)
    open(INKMLFILEPATH, "w")
    INKML_TREE.write(INKMLFILEPATH, encoding="UTF-8", xml_declaration=True)
    F1 = open(INKMLFILEPATH, "r")
    PARSER = parseString(F1.read())
    F1.close()
    F = open(INKMLFILEPATH, "w")
    F.write(PARSER.toprettyxml())
    F.close()
"""

    #Exemple de commande sur le terminal :
    #python3 txt_to_InkML.py BDD/datalabel.txt BDD/datanormalise.txt generated.inkml 50 tabclass.txt
    #python3 txt_to_InkML.py labelsFile dataFile output.inkml fps tableauclass.txt

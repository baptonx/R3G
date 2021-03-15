"""Convertisseur inkml to txt"""

import sys
import os
import xml.etree.ElementTree as ET

def write_label(tree, flabel, fclass):
    """ajout des annotations au fichier labeltxt"""
    annotations = {}
    root = tree.getroot()
    nb_annotation = 0
    dictclass = {}
    for line in fclass:
        line = line.replace('\n', '')
        tabtemp = line.split(';')
        dictclass[tabtemp[1]] = tabtemp[0]
    for child in root:
        if child.tag == "{http://www.w3.org/2003/InkML}annotationXML":
            if child.attrib == {'type': 'actions'}:
                action = {}
                nb_annotation += 1
                for children in child:
                    action[children.attrib['type']] = children.text
                annotations[nb_annotation] = action
    print("dict : " + str(dictclass))
    for id_elem in annotations:
        line = ""
        line += dictclass[annotations[id_elem]["type"]]
        line += ","
        line += annotations[id_elem]["debut"]
        line += ","
        line += annotations[id_elem]["fin"]
        flabel.write(line + "\n")

def write_data(tree, fdata):
    """ajout des donnees au fichier datatxt"""
    root = tree.getroot()
    nb_articulations = 0
    donnees = {}
    string = ""
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
    for id_elem in range(len(donnees[0])):
        string = ""
        for articulation in donnees:
            ## -1 sur len car on ne veut pas lire le timestamp
            for point in range(len(donnees[articulation][id_elem]) - 1):
                string += donnees[articulation][id_elem][point] + " "
                print(donnees[articulation][id_elem][point])
        fdata.write(string + "\n")



if __name__ == "__main__":
    INKMLFILEPATH = sys.argv[1]
    TABCLASSPATH = sys.argv[2]
    FILENAME = os.path.splitext(os.path.basename(INKMLFILEPATH))[0]
    FDATA = open(FILENAME + "_data.txt", "w")
    FLABEL = open(FILENAME + "_label.txt", "w")

    TREE = ET.parse(INKMLFILEPATH)
    TABCLASSFILE = open(TABCLASSPATH, "r")
    write_label(TREE, FLABEL, TABCLASSFILE)
    write_data(TREE, FDATA)
    FDATA.close()
    FLABEL.close()
    TABCLASSFILE.close()

    #Exemple de commande sur le terminal :
    #python3 inkml_to_txt.py BDD/sequence1.inkml BDD/tabclass_exemple_data.txt
    #python3 inkml_to_txt.py inkmlFile classCorrespondanceFile

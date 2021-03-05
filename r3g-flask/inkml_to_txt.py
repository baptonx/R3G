"""Convertisseur inkml to txt"""

import sys, os
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import SubElement
from xml.dom.minidom import parseString

def write_label(TREE, FLABEL, FCLASS):
    """ajout des annotations au fichier labeltxt"""
    annotations = {}
    class_enregistrée = {}
    name="sequence1"
    root = TREE.getroot()
    nb_annotation = 0
    nb_articulations = 0
    nb_others = 0
    for child in root:
        if child.tag == "{http://www.w3.org/2003/InkML}annotationXML":
            if child.attrib == {'type': 'actions'}:
                action = {}
                nb_annotation += 1
                for children in child:
                    action[children.attrib['type']] = children.text
                annotations[nb_annotation] = action
    print(annotations)
    for id_elem in range(len(donnees[0])):
        string = ""
        for articulation in donnees:
            ## -1 sur len car on ne veut pas lire le timestamp
            for point in range(len(donnees[articulation][id_elem]) - 1):
                string += donnees[articulation][id_elem][point] + " "
                print(donnees[articulation][id_elem][point])
        FDATA.write(string + "\n")
    
def write_data(TREE, FDATA):
    """ajout des donnees au fichier datatxt"""
    root = TREE.getroot()
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
        FDATA.write(string + "\n")



if __name__ == "__main__":
    INKMLFILEPATH = sys.argv[1]
    FILENAME = os.path.splitext(os.path.basename(INKMLFILEPATH))[0]
    FDATA = open(FILENAME + "_data.txt", "w")
    FLABEL = open(FILENAME + "_label.txt", "w")
    FCLASS = open(FILENAME + "_class.txt", "w")

    TREE = ET.parse(INKMLFILEPATH)
    write_label(TREE, FLABEL, FCLASS)
    write_data(TREE, FDATA)
    FDATA.close()
    FLABEL.close()

    #Exemple de commande sur le terminal :
    #python3 txt_to_InkML.py BDD/datalabel.txt BDD/datanormalise.txt generated.inkml 50
    #python3 txt_to_InkML.py labelsFile dataFile output.inkml fps

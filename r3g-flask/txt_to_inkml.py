"""Convertisseur txt to inkml"""

import sys
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import SubElement
from xml.dom.minidom import parseString

def generate_template():
    """On genere un template"""
    root = ET.Element('ink', {"xmlns":"http://www.w3.org/2003/InkML"})
    trace_format = SubElement(root, 'traceFormat')
    SubElement(trace_format, 'channel', {"name":"X", "type":"decimal"})
    SubElement(trace_format, 'channel', {"name":"Y", "type":"decimal"})
    SubElement(trace_format, 'channel', {"name":"Z", "type":"decimal"})
    SubElement(trace_format, 'channel', {"name":"timestamp", "type":"decimal"})
    return ET.ElementTree(root)

def add_labels(inkmltree, labels, dictclass):
    """on ajoute les annotations a l'arbre passe en param"""
    root = inkmltree.getroot()
    filelabels = open(labels, 'r')
    for line in filelabels:
        label = line[:-1].split(',')
        annotation_xml = SubElement(root, 'annotationXML')
        annotation_xml.set('type', 'action')
        annotation = SubElement(annotation_xml, 'annotation')
        annotation.set('type', 'type')
        annotation.text = dictclass[label[0]]
        annotation = SubElement(annotation_xml, 'annotation')
        annotation.set('type', 'Debut')
        annotation.text = label[1]
        annotation = SubElement(annotation_xml, 'annotation')
        annotation.set('type', 'Fin')
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

    #Exemple de commande sur le terminal :
    #python3 txt_to_InkML.py BDD/datalabel.txt BDD/datanormalise.txt generated.inkml 50 tabclass.txt
    #python3 txt_to_InkML.py labelsFile dataFile output.inkml fps tableauclass.txt

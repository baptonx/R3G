import os
import sys
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import Element, SubElement, Comment, tostring
from xml.dom.minidom import parseString

'''
def createTemplate(inkmlFile):
	fileTemplate = open('templateInkML','r')
	file = open(inkmlFile, 'w')
	line = fileTemplate.read()
	file.write(str(line))
	return file
'''
def generateTemplate():
	root = ET.Element('ink',{"xmlns":"http://www.w3.org/2003/InkML"})
	traceFormat = SubElement(root,'traceFormat')
	SubElement(traceFormat,'channel',{"name":"X","type":"decimal"})
	SubElement(traceFormat,'channel',{"name":"Y","type":"decimal"})
	SubElement(traceFormat,'channel',{"name":"Z","type":"decimal"})
	SubElement(traceFormat,'channel',{"name":"timestamp","type":"decimal"})
	return ET.ElementTree(root)

def addLabels(inkMLTree,labels):
	root = inkMLTree.getroot()
	fileLabels = open(labels,'r')
	for line in fileLabels:
		label = line[:-1].split(',')
		annotationXML = SubElement(root,'annotationXML')
		annotationXML.set('type','action')
		annotation = SubElement(annotationXML,'annotation')
		annotation.set('type','type')
		annotation.text = label[0]
		annotation = SubElement(annotationXML,'annotation')
		annotation.set('type','Debut')
		annotation.text = label[1]
		annotation = SubElement(annotationXML,'annotation')
		annotation.set('type','Fin')
		annotation.text = label[2]

def addData(inkMLTree,data,fps):
	root = inkMLTree.getroot()
	fileData = open(data,'r')
	timeStamp = 0
	traces = {}
	traceGroup = SubElement(root,'traceGroup')
	for line in fileData:
		positions = line[:-1].split(' ')
		for i in range(int(len(positions)/3)):
			traces.setdefault(str(i),[])
			traces[str(i)] += [[positions[3*i],positions[3*i+1],positions[3*i+2],str(timeStamp)]]
		timeStamp += 1/fps
	for articulation in traces.keys():
		trace = SubElement(traceGroup,'trace')
		trace.text = ''
		for tab in traces[articulation]:
			for elem in tab:
				trace.text = str(trace.text)+str(elem)+' '
			trace.text = trace.text[:-1]+', '
		trace.text = trace.text[:-2]



if __name__ == "__main__":
	labels = sys.argv[1]
	data = sys.argv[2]
	inkmlFilePath = sys.argv[3]
	fps = int(sys.argv[4])
	inkmlTree = generateTemplate()
	addLabels(inkmlTree, labels)
	addData(inkmlTree, data, fps)
	open(inkmlFilePath, "w")
	inkmlTree.write(inkmlFilePath, encoding="UTF-8", xml_declaration=True)
	f1 = open(inkmlFilePath, "r")
	parser = parseString(f1.read())
	f1.close()
	f = open(inkmlFilePath, "w")
	f.write(parser.toprettyxml())
	f.close()

	#Exemple de commande sur le terminal : python3 txt_to_InkML.py BDD/datalabel.txt BDD/datanormalise.txt generated.inkml 50
	#python3 txt_to_InkML.py labelsFile dataFile output.inkml fps
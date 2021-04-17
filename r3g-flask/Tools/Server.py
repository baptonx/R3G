# create an INET, STREAMing socket
import socket,sys
import threading
import time
from typing import List
sys.setrecursionlimit(5000)
from OnlineExecuterOC3D import OnlineExecuterOC3D
import tensorflow as tf
physical_devices = tf.config.experimental.list_physical_devices('GPU')
assert len(physical_devices) > 0, "Not enough GPU hardware devices available"

configAll = tf.config.experimental.set_memory_growth(physical_devices[0], True)

HOST = 'localhost'
PORT = 80
counter = 0  # compteur de connexions actives

# 1) création du socket :
mySocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
mySocket.setblocking(True)
# 2) liaison du socket à une adresse précise :
try:
    mySocket.bind((HOST, PORT))
except socket.error:
    print("La liaison du socket à l'adresse choisie a échoué.")
    sys.exit()


class Receiver (threading.Thread):
    def __init__(self, listeToDo,connexion):
        threading.Thread.__init__(self)
        self.listeToDo : List[str] = listeToDo
        self.connexion = connexion

    def run(self):
        while 1:
            msgClient = self.connexion.recv(3900).decode("Utf8")
            self.listeToDo.extend(filter(lambda s: s!="" , msgClient.split("\n")))

class TreaterAndResponder(threading.Thread):
    def __init__(self, listeToDo:List[str],connexion,onlineExecter):
        threading.Thread.__init__(self)
        self.listeToDo = listeToDo
        self.connexion = connexion

    def run(self):
        while 1:
            for t in self.listeToDo:
                timeStamp, rejection, prediction = onlineExecter.doExec(t)
                if rejection is not None:
                    msgToSend = str(timeStamp) + ";" + str(rejection) + ";" + str(prediction)
                    self.connexion.send(msgServeur.encode("Utf8"))
                    print(msgToSend)
            self.listeToDo.clear()



while 1:
    # 3) Attente de la requête de connexion d'un client :
    print("Serveur prêt, en attente de requêtes ...")
    mySocket.listen(2)

    # 4) Etablissement de la connexion :
    connexion, adresse = mySocket.accept()
    counter += 1
    print("Client connecté, adresse IP %s, port %s" % (adresse[0], adresse[1]))

    # 5) Dialogue avec le client :
    msgServeur = "Vous êtes connecté au serveur OC3D. Path Model ?"
    connexion.send(msgServeur.encode("Utf8"))

    pathModel = connexion.recv(3000).decode("Utf8")


    onlineExecter = OnlineExecuterOC3D(pathModel)

    msgServeur = "Envoyez les postures, format standard précédé d'un timestamp et d'un point virgule.\n Ex: 78; 1.54 157.5 12...."
    connexion.send(msgServeur.encode("Utf8"))


    todo = []
    receiver = Receiver(todo,connexion)
    responder = TreaterAndResponder(todo,connexion,onlineExecter)

    receiver.start()
    responder.start()

    while 1:
        time.sleep(2)

    # 6) Fermeture de la connexion :
    connexion.send("fin".encode("Utf8"))
    print("Connexion interrompue.")
    connexion.close()

    # ch = input("<R>ecommencer <T>erminer ? ")
    # if ch.upper() == 'T':
    break
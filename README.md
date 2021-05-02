L'utilisateur doit cloner le dépôt git pour utiliser la suite logicielle R3G.

## Installation manuelle (utilisation de WSL ou de Linux recommandée)

- Installation de Python3 pour le serveur :
```bash
sudo apt-get update
sudo apt-get install python3
sudo apt-get install python3-pip
```
- Installation des différentes bibliothèques (remplacer XXX par votre clé wandb) :
```bash
cd r3g-flask
pip install wandb
pip install flask
pip install -r requirements.txt
wandb login XXX
python3 server.py
```

- Installation de Angular (nécessite l'installation de npm et de NodeJS) :
```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g @angular/cli
cd r3g-angular/R3GAngular
npm install --save three
ng serve
```
-- 

# Installation automatisée avec Docker

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io
cd r3g-flask
docker build -t r3g-flask .
docker run -d -p 0.0.0.0:5000:5000 r3g-flask
cd ../r3g-angular/R3GAngular
docker build -t r3g-angular .
docker run -d -p 0.0.0.0:8080:8080 r3g-angular
```

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
pip install wandb
pip install flask
pip install -r requirements.txt
wandb login XXX
```

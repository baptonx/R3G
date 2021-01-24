import wandb
import json
from flask import Flask
import numpy as np
from PIL import Image
from matplotlib import pyplot as plt


app = Flask(__name__)
api = wandb.Api()
def startWandb():
    run = api.run("recoprecoce-intui/36mcvs8u")
    im = run.file("FilesResult/DetailedConfusionsMatrix/confMatrixAt0.png").download(replace=True)
    image=Image.open("FilesResult/DetailedConfusionsMatrix/confMatrixAt0.png")
    print(np.asarray(image))


@app.route('/models/getAllNames')
def index():
    runs = api.runs("recoprecoce-intui")
    name_list = []
    for run in runs:
        if run.state == 'finished' and run.tags.count('GLU_Rpz')>0:
            name_list.append(run.name)
    return json.dumps(name_list)


if __name__ == "__main__":
    app.run()
    #startWandb()

FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install -y python3-pip python3-dev build-essential
COPY . /app
WORKDIR /app
RUN pip3 install --upgrade pip && /usr/local/bin/pip3 install Flask
RUN pip install wandb && wandb login 041f848335f8b0cc034a549438bfd49bd2d229e7
RUN pip install -r requirements.txt
ENTRYPOINT ["python3"]
CMD ["Server.py"]


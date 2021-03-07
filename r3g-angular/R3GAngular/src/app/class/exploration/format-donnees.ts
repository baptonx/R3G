export class FormatDonnees {
  value: string;
  children: FormatDonnees[];

  constructor(v: string = ''){
    this.value = v;
    this.children = [];
  }

  // Ajoute une nouvelle valeur a l'objet FormatDonnees courant. sa valeur est le dernier element
  //de la liste index et le reste de la liste constitue son chemin
  add(index: string[]) {
    if(index.length === 0) {
      return;
    }
    let courant = index.shift();
    let childIndex = this.children.findIndex((element) => element.value === courant);
    if(childIndex >= 0) {
      this.children[childIndex].add(index);
    }
    else {
      let fParent: FormatDonnees = this;
      let fCourant: FormatDonnees;
      do {
        fCourant = new FormatDonnees(courant);
        fParent.children.push(fCourant);
        fParent = fCourant;
        courant = index.shift();
      }while(index.length > 0)
    }
  }

  concat(fd: FormatDonnees): void {
    if(this.feuille()) {
      this.children.push(fd);
      return;
    }
    for(let child of this.children) {
      let fdIndex = fd.children.findIndex((elem) => elem.value === child.value);
      if(fdIndex >= 0) {
        child.concat(fd.children[fdIndex]);
      }
      else {
        this.children.push(fd);
      }
    }
  }

  feuille(): boolean {
    return this.children.length === 0;
  }
}

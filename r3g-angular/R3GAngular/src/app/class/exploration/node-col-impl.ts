// Objet recursif pour representer les donnees propres a une ou plusieurs sequences.
export interface NodeColForParsing{
  // nom de la donnee
  name: string;
  // chemin de la donnee (le nom de tous les peres du noeud espaces par des points)
  path: string;
  // attribut indiquant si la donnee doit etre affichee dans le tableau
  completed: boolean;
  // noeuds fils de children
  children: NodeCol[];
}
export interface NodeCol extends NodeColForParsing {
  // nom de la donnee
  name: string;
  // chemin de la donnee (le nom de tous les peres du noeud espaces par des points)
  path: string;
  // attribut indiquant si la donnee doit etre affichee dans le tableau
  completed: boolean;
  // noeuds fils de children
  children: NodeCol[];
  push(index: string[]): void;
  add(index: string[], path: string): void;
  concat(node: NodeCol): void;
  feuille(): boolean;
  convertNodeColForParsingToNodeCol(ncfp: NodeColForParsing): void;
}

export class NodeColImpl implements NodeCol {
  name: string;
  path: string;
  completed: boolean;
  children: NodeCol[];
  constructor(n: string = '', p: string = '') {
    this.name = n;
    this.path = p;
    this.completed = false;
    this.children = [];
  }
  // Ajoute un noeud au noeud racine. Le chemin du noeud est indique dans l'attribut index
  push(index: string[]): void {
    this.add(index, '/');
  }
  // Ajoute un noeud depuis un autre noeud dont le chemin a partir ddu noeud courant est dans index, et le chemin deja
  // parcouru est dans path
  add(index: string[], path: string): void {
    if (index.length === 0) {
      return;
    }
    let courant = index.shift();
    const childIndex = this.children.findIndex((element) => element.name === courant);
    if (childIndex >= 0) {
      this.children[childIndex].add(index, path + '.' + courant);
    }
    else {
      let fParent: NodeCol = this;
      let fCourant: NodeCol = new NodeColImpl(courant, path);
      fParent.children.push(fCourant);
      while (index.length > 0) {
        fParent = fCourant;
        courant = index.shift();
        if (path !== '') {
          path += '.';
        }
        path += fParent.name;
        fCourant = new NodeColImpl(courant, path);
        fParent.children.push(fCourant);
      }
    }
  }
  // Ajoute a un noeud tous les attributs du noeud passe en parametre
  concat(node: NodeCol): void {
    if (this.feuille()) {
      this.children.push(node);
      return;
    }
    for (const child of this.children) {
      const fdIndex = node.children.findIndex((elem) => elem.name === child.name);
      if (fdIndex >= 0) {
        child.concat(node.children[fdIndex]);
      }
      else {
        this.children.push(node);
      }
    }
  }
  // Indique si le noeud a des fils ou non
  feuille(): boolean {
    return this.children.length === 0;
  }
  convertNodeColForParsingToNodeCol(ncfp: NodeColForParsing): void {
    this.name = ncfp.name;
    this.path = ncfp.path;
    this.completed = ncfp.completed;
    this.children = [];
    let child: NodeColImpl;
    for (const childP of ncfp.children) {
      child = new NodeColImpl();
      child.convertNodeColForParsingToNodeCol(childP);
      this.children.push(child);
    }
  }
}

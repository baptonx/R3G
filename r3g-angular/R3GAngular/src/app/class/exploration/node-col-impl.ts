export interface NodeCol{
  name: string;
  path: string;
  completed: boolean;
  children: NodeCol[];
  push(index: string[]): void;
  add(index: string[], path: string): void;
  concat(node: NodeCol): void;
  feuille(): boolean;
}

export class NodeColImpl {
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
  push(index: string[]): void {
    this.add(index, '/');
  }
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
  feuille(): boolean {
    return this.children.length === 0;
  }
}

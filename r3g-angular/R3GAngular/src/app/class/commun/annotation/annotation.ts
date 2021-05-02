export class Annotation {
  t1 = 0;
  t2 = 0;
  f1 = 0;
  f2 = 0;
  pointAction = 0;
  classeGeste = '';
  ia = false;


  public verifyF1BeforeF2(): void {
    if (this.f1 > this.f2) {
      const temp = this.f2;
      this.f2 = this.f1;
      this.f1 = temp;
    }
  }

  public verifyT1BeforeT2(): void {
    if (this.t1 > this.t2) {
      const temp = this.t2;
      this.t2 = this.t1;
      this.t1 = temp;
    }
  }

  public cloneTest(): Annotation {
    const a = new Annotation();
    a.t1 = this.t1;
    a.t2 = this.t2;
    a.f1 = this.f1;
    a.f2 = this.f2;
    a.pointAction = this.pointAction;
    a.classeGeste = this.classeGeste;
    return a;
  }

}

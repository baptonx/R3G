export class Annotation {
  t1 = 0;
  t2 = 0;
  f1 = 0;
  f2 = 0;
  pointAction = 0;
  classeGeste = '';


  public verifyT1BeforeT2(): void {
    if (this.t1 > this.t2) {
      const temp = this.t2;
      this.t2 = this.t1;
      this.t1 = temp;
    }
  }

}

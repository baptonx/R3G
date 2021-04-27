export class Annotation {
  t1!: number;
  t2!: number;
  f1!: number;
  f2!: number;
  pointAction!: number;
  classe_geste!: string;


  public verifyT1BeforeT2(): void {
    if (this.t1 > this.t2) {
      const temp = this.t2;
      this.t2 = this.t1;
      this.t1 = temp;
    }
  }

}

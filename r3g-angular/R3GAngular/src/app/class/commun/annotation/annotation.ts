export class Annotation {
  public t1!: number;
  public t2!: number;
  public f1!: number;
  public f2!: number;
  public pointAction!: number;
  public classeGeste!: string;


  public verifyT1BeforeT2(): void {
    if (this.t1 > this.t2) {
      const temp = this.t2;
      this.t2 = this.t1;
      this.t1 = temp;
    }
  }

}

export interface Agent<I, O> {
  name: string;
  run(input: I): Promise<O>;
}
type F = (a: any) => any;
type Pipe = (...fs: F[]) => (a?: any) => Promise<any>;
export const pipe: Pipe = (...fs: F[]) => fs.reduce((a, b) => async (param: any) => b(await a(param)));

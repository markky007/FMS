declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
  export function serve(
    handler: (req: Request) => Promise<Response> | Response
  ): void;
}

declare module "https://*" {
  const content: any;
  export default content;
  export const serve: any;
  export const createClient: any;
}

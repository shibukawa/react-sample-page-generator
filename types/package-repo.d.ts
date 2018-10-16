declare module "package-repo" {
    interface IResult {
        user: string;
        repo: string;
        branch: string;
        tarball_url: string;
        clone_url?: string;
        https_url: string;
        travis_url: string;
        api_url?: string;
        zip_url?: string;
    }

    function packageRepo(path: string): IResult | null;
    namespace packageRepo { }
    export = packageRepo;
}

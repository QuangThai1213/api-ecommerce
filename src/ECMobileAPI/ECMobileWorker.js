import ECMobileAPI from "./ECMobileAPI";
export default class ECMobileWorker {
    _api = null;

    static init = ({
        url,
        access_token,
        version = "v1",
        language
    }) => {
        try {
            this._api = new ECMobileAPI({
                url,
                access_token,
                version,
                language
            });
        } catch (error) {
            console.log(error);
        }
    };


    static getCategories = async () => {
        try {
            const response = await this._api.get("category", {
                hide_empty: true,
                per_page: 100,
                order: "desc",
                orderby: "count"
            });
            return response.json();
        } catch (err) {
            console.log(err);
        }
    };
}
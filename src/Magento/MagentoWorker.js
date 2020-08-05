import MagentoAPI from "./MagentoAPI";
// const defaultOptions = {
//     url: null,
//     store: 'default',
//     userAgent: 'QuangThai',
//     home_cms_block_id: '',
//     authentication: {
//       integration: {
//         access_token: undefined,
//       },
//     },
//   };
export default class MagentoWorker {
    _api = null;

    static init = ({
        url,
        store = "default",
        userAgent = "",
        access_token,
        home_cms_block_id = "",
        version = "2",
        language
    }) => {
        try {
            this._api = new MagentoAPI({
                url,
                store,
                userAgent,
                access_token,
                home_cms_block_id,
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
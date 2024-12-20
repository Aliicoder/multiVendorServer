import express from 'express';
import { refreshAdmin, refreshClient, refreshSeller } from '../middlewares/refreshes';
const refreshRoute = express.Router()
refreshRoute.route("/admin")
  .get(refreshAdmin)
refreshRoute.route("/seller")
  .get(refreshSeller)
refreshRoute.route("/client")
  .get(refreshClient)

export default refreshRoute
const { verificarToken } = require('../middlewares/auth');
const pagos = require('../modulos/pagos.modulo');

const router = express.Router();

router.use(verificarToken);
router.post('/', pagos.pagar);
router.get('/', pagos.listarMios);
router.get('/:id', pagos.obtener);

module.exports = router;

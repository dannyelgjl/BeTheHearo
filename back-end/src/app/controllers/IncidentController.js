import connectDatabase from '../../database/index';

class IncidentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const [count] = await connectDatabase('incidents').count();

    console.log(count);
    const incidents = await connectDatabase('incidents')
      .limit(5)
      .offset((page - 1) * 5)
      .select('*');

    res.header('X-Total-Count', count['count(*)']);

    return res.json(incidents);
  }

  async store(req, res) {
    const { title, description, value } = req.body;
    const ong_id = req.headers.authorization;

    const [id] = await connectDatabase('incidents').insert({
      title,
      description,
      value,
      ong_id,
    });

    return res.json({ id });
  }

  async delete(req, res) {
    const { id } = req.params;

    const ong_id = req.headers.authorization;

    const incident = await connectDatabase('incidents')
      .where('id', id)
      .select('ong_id')
      .first();

    if (incident.ong_id !== ong_id) {
      return res.status(401).json({ error: 'Operation not permitted' });
    }

    await connectDatabase('incidents').where('id', id).delete();

    return res.status(204).send();
  }
}

export default new IncidentController();

app.get('/books', async (req, reply) => {
  const user = (req.query as any).user;
  if (!user) return reply.code(400).send({ error: 'missing user address' });

  const result = await pool.query(
    `SELECT token_id, chain_tx, created_at
     FROM nft_mints
     WHERE address = $1
     ORDER BY created_at DESC`,
    [user]
  );

  const books = result.rows.map((r) => ({
    token_id: r.token_id,
    title: BOOK_METADATA[r.token_id]?.title || 'Untitled',
    cover_image: BOOK_METADATA[r.token_id]?.cover || '',
    viewer_url: `https://readfi.app/viewer/${r.token_id}`,
    mint_tx: r.chain_tx,
    minted_at: r.created_at,
  }));

  return { books };
});

// 模擬書籍資料
const BOOK_METADATA: Record<string, { title: string; cover: string }> = {
  '1001': {
    title: 'The Future of Reading',
    cover: 'https://cdn.readfi.app/books/1001.jpg',
  },
  '1002': {
    title: 'Blockchain Literacy',
    cover: 'https://cdn.readfi.app/books/1002.jpg',
  },
};

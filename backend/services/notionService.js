const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

class NotionService {
  // ポートフォリオ一覧取得
  async getPortfolio() {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: 'created_at',
            direction: 'descending',
          },
        ],
      });

      return response.results.map(page => ({
        id: page.id,
        ticker: page.properties.ticker?.rich_text[0]?.plain_text || '',
        name: page.properties.name?.title[0]?.plain_text || '',
        shares: page.properties.shares?.number || 0,
        buy_price: page.properties.buy_price?.number || 0,
        created_at: page.properties.created_at?.date?.start || '',
        updated_at: page.properties.updated_at?.date?.start || '',
      }));
    } catch (error) {
      console.error('Notion API エラー:', error);
      throw new Error('ポートフォリオの取得に失敗しました');
    }
  }

  // 株式追加
  async addStock(stockData) {
    try {
      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          ticker: {
            rich_text: [
              {
                text: {
                  content: stockData.ticker,
                },
              },
            ],
          },
          name: {
            title: [
              {
                text: {
                  content: stockData.name,
                },
              },
            ],
          },
          shares: {
            number: stockData.shares,
          },
          buy_price: {
            number: stockData.buy_price,
          },
          created_at: {
            date: {
              start: new Date().toISOString(),
            },
          },
          updated_at: {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      });

      return {
        id: response.id,
        ticker: stockData.ticker,
        name: stockData.name,
        shares: stockData.shares,
        buy_price: stockData.buy_price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Notion API エラー:', error);
      throw new Error('株式の追加に失敗しました');
    }
  }

  // 株式更新
  async updateStock(id, stockData) {
    try {
      await notion.pages.update({
        page_id: id,
        properties: {
          ticker: {
            rich_text: [
              {
                text: {
                  content: stockData.ticker,
                },
              },
            ],
          },
          name: {
            title: [
              {
                text: {
                  content: stockData.name,
                },
              },
            ],
          },
          shares: {
            number: stockData.shares,
          },
          buy_price: {
            number: stockData.buy_price,
          },
          updated_at: {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      });

      return {
        id,
        ticker: stockData.ticker,
        name: stockData.name,
        shares: stockData.shares,
        buy_price: stockData.buy_price,
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Notion API エラー:', error);
      throw new Error('株式の更新に失敗しました');
    }
  }

  // 株式削除
  async deleteStock(id) {
    try {
      await notion.pages.update({
        page_id: id,
        archived: true,
      });

      return { success: true };
    } catch (error) {
      console.error('Notion API エラー:', error);
      throw new Error('株式の削除に失敗しました');
    }
  }
}

module.exports = new NotionService(); 
import './App.css';
import TransactionList from "./components/TransactionList";
import EditItem from "./components/EditItem"; // Import EditItem
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Divider, Spin, Typography } from 'antd';
import AddItem from './components/AddItem';
import axios from 'axios';

const URL_TXACTIONS = '/api/txactions';

function FinanceScreen() {
  const [summaryAmount, setSummaryAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [editItem, setEditItem] = useState(null); // เก็บข้อมูลแถวที่ต้องการแก้ไข

  // ดึงข้อมูลจาก API
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(URL_TXACTIONS);
      setTransactionData(response.data.data.map(row => ({
        id: row.id,
        key: row.id,
        ...row.attributes
      })));
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // เพิ่มข้อมูลใหม่
  const handleAddItem = async (item) => {
    try {
      setIsLoading(true);
      const params = { ...item, action_datetime: dayjs() };
      const response = await axios.post(URL_TXACTIONS, { data: params });
      const { id, attributes } = response.data.data;
      setTransactionData([
        ...transactionData,
        { id: id, key: id, ...attributes }
      ]);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // แก้ไขข้อมูล
  const handleRowEdit = (item) => {
    console.log("Editing item:", item);
    setEditItem(item);
  };

  const handleSaveItem = async (updatedItem) => {
    try {
      setIsLoading(true);
      await axios.put(`${URL_TXACTIONS}/${updatedItem.id}`, { data: updatedItem });
      setTransactionData(transactionData.map(item => item.id === updatedItem.id ? updatedItem : item));
      setEditItem(null);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ลบข้อมูล
  const handleRowDeleted = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`${URL_TXACTIONS}/${id}`);
      fetchItems();
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    setSummaryAmount(transactionData.reduce(
      (sum, transaction) => (
        transaction.type === "income" ? sum + transaction.amount : sum - transaction.amount
      ), 0)
    );
  }, [transactionData]);

  return (
    <div className="App">
      <header className="App-header">
        <Spin spinning={isLoading}>
          <Typography.Title>
            จำนวนเงินปัจจุบัน {summaryAmount} บาท
          </Typography.Title>

          <AddItem onItemAdded={handleAddItem} />
          <Divider>บันทึก รายรับ - รายจ่าย</Divider>
          <TransactionList
            data={transactionData}
            onRowEdit={handleRowEdit}
            onRowDeleted={handleRowDeleted}
          />
        </Spin>
      </header>

      <EditItem
        visible={!!editItem}
        initialValues={editItem}
        onCancel={() => setEditItem(null)}
        onSave={handleSaveItem}
      />
    </div>
  );
}

export default FinanceScreen;




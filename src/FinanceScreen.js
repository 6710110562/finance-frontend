import './App.css';
import TransactionList from "./components/TransactionList";
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Divider, Modal, Form, Input, Select, Spin, Typography } from 'antd';
import AddItem from './components/AddItem';
import axios from 'axios';

const URL_TXACTIONS = '/api/txactions';

function FinanceScreen() {
  const [summaryAmount, setSummaryAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [editItem, setEditItem] = useState(null); // เก็บข้อมูลแถวที่ต้องการแก้ไข
  const [form] = Form.useForm();

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
    console.log("Editing item:", item); // Debug ข้อมูลแถวที่เลือก
    setEditItem(item); // อัปเดต editItem
  };

  const handleSaveItem = async (updatedItem) => {
    try {
      setIsLoading(true);
      await axios.put(`${URL_TXACTIONS}/${updatedItem.id}`, { data: updatedItem });
      setTransactionData(transactionData.map(item => item.id === updatedItem.id ? updatedItem : item));
      setEditItem(null); // ปิด Modal
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
    if (editItem) {
      console.log("Updating form with editItem:", editItem); // Debug
      form.setFieldsValue(editItem); // อัปเดตฟอร์ม
    }
  }, [editItem, form]);

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

      {/* Modal สำหรับแก้ไข */}
      <Modal
        title="Edit Transaction"
        open={!!editItem}
        onCancel={() => setEditItem(null)}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            const updatedItem = {
              ...editItem,
              ...values,
            };
            handleSaveItem(updatedItem);
          } catch (err) {
            console.error('Validation Failed:', err);
          }
        }}
      >
        {editItem && (
          <Form form={form} layout="vertical" initialValues={editItem}>
            <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select a type!' }]}>
              <Select>
                <Select.Option value="income">Income</Select.Option>
                <Select.Option value="expense">Expense</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please enter an amount!' }]}>
              <Input type="number" />
            </Form.Item>

            <Form.Item name="note" label="Note">
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

export default FinanceScreen;



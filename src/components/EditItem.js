import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";

const EditItem = ({ visible, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();

  // รีเฟรชค่าในฟอร์มเมื่อเปิด Modal หรือค่า initialValues เปลี่ยน
  useEffect(() => {
    if (visible && initialValues) {
      console.log("Updating form with initialValues:", initialValues);
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedItem = {
        ...initialValues,
        ...values,
      };
      onSave(updatedItem); // ส่งข้อมูลที่แก้ไขกลับไป
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  return (
    <Modal
      title="Edit Transaction"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: "Please select a type!" }]}
        >
          <Select>
            <Select.Option value="income">Income</Select.Option>
            <Select.Option value="expense">Expense</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: "Please enter an amount!" }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item name="note" label="Note">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditItem;

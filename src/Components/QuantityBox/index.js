import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import Button from "@mui/material/Button";

const QuantityBox = ({ value = 1, onChange }) => {
  const handleIncrease = () => {
    onChange(value + 1);
  };

  const handleDecrease = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  return (
    <div className="quantityDrop d-flex align-items-center mr-3">
      <Button onClick={handleDecrease}>
        <FaMinus />
      </Button>
      <input type="text" value={value} readOnly className="text-center" />
      <Button onClick={handleIncrease}>
        <FaPlus />
      </Button>
    </div>
  );
};

export default QuantityBox;

import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import PropTypes from "prop-types"; 
const counterURL = process.env.REACT_APP_API_COUNTER;

const lastOrderURL = process.env.REACT_APP_API_LASTORDER;

export const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [counter, setCounter] = useState();
  const [token] = useState("");
  const [lastOrder, setLastOrder] = useState([]);
  const [sales, setSales] = useState({});
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [editAbleData, setEditAbleData] = useState();
  const [table, setTable] = useState("Products");
  const [inventoryTable, setInventoryTable] = useState([]);
  const [rowSelectionModelOrders, setRowSelectionModelOrders] = useState();
  const [flagInsertItem,setFlagInsertItem] = useState(false); 
  const [bannerData, setBannerData] = useState({});
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 1000,
  });
  const [tableOrders, setTableOrders] = useState("new");
  const [flagOrders, setFlagOrders] = useState(false);
  const [cardsData, setCardsData] = useState({});
  const [which, setWhich] = useState("Products");
  const [choosenCards, setChoosenCards] = useState("");

  let formData = new FormData();
  const fetchInventory = () => {
    if (table === "Products") {
      fetch("http://localhost:3131/api/inventoryTables/products")
        .then((res) => res.json())
        .then((data) => {
          setInventoryTable(data.products);
        });
    } else {
      fetch("http://localhost:3131/api/inventoryTables/bestseller")
        .then((res) => res.json())
        .then((data) => {
          setInventoryTable(data.bestseller);
        });
    }
  };

  const fetchMonths = async (month) => {
    try {
      const response = await fetch(
        `http://localhost:3131/api/totalMonths/${month}`
      );
      const data = await response.json();
      setSales((prevSales) => ({ ...prevSales, [month]: data[month] }));
    } catch (error) {
      console.error(`Error fetching ${month}`, error);
    }
  };

  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const fetchData = async () => {
    for (const month of months) {
      await fetchMonths(month);
    }
  };
  const orderFinishProcess = async (rowSelectionModelOrders) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ finishOrderId: rowSelectionModelOrders }),
    };
    fetch("http://localhost:3131/api/orders", options)
      .then((res) => res.json())
      .then((data) => {
        console.log("res recived", data);
      })
      .catch((error) => {
        console.error("Error moving data to another table", error);
      });
  };

  const updateData = async () => {
    console.log("Updated Data", editAbleData, "From", table);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ editAbleData, table }),
    };
    fetch("http://localhost:3131/api/updateData", options)
      .then((res) => res.json())
      .then((data) => {
        console.log("res recived", data);
      })
      .catch((error) => {
        console.error("Error updating data", error);
      });
  };

  const fetchAllOrders = async () => {
    try {
      const response = await fetch(
        `http://localhost:3131/api/orders?page=${pageState.page}&pageSize=${pageState.pageSize}&type=${tableOrders}`
      );
      const json = await response.json();
      setPageState((old) => ({
        ...old,
        isLoading: false,
        data: json.orders,
        total: json.total,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      setPageState((old) => ({ ...old, isLoading: false }));
    }
  };
  const postIdForDelete = () => {
    const idForDelete = rowSelectionModel;
    const idForDeleteOrders = rowSelectionModelOrders;
  
    console.log(flagOrders,idForDelete,table);
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (flagOrders) {
      options.body = JSON.stringify({ idForDeleteOrders, tableOrders });
    } else {
      options.body = JSON.stringify({ idForDelete, table });
    }
    fetch("http://localhost:3131/api/deleteID", options)
      .then((res) => res.json())
      .then((data) => {
        console.log("res recived", data);

        console.log(options);
      })
      .catch((error) => {
        console.error("Error sending req", error);
      });
  };
  
  const fetchCounter = () => {
    axios
      .get(counterURL)
      .then((response) => {
        setCounter(response.data.counterOp);
        console.log(counter);
      })
      .catch((error) => {
        console.error("Error fetching counter", error);
      });
  };
  const fetchEditBanners = () => {
    axios
      .get("http://localhost:3131/api/contentdata/banners")
      .then((response) => {
        setBannerData(response.data.contentData.banners);
      })
      .catch((error) => {
        console.error("Error fetching content data", error);
      });
  };
  const fetchEditCards = () => {
    axios
      .get("http://localhost:3131/api/contentdata/cards")
      .then((response) => {
        setCardsData(response.data.contentData.cards);
      })
      .catch((error) => {
        console.log(error,"Error fetching Cards data");
      });
  };

  useEffect(() => {
    fetchData();

    const fetchLastOrder = () => {
      fetch(lastOrderURL)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setLastOrder(data);
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    };
    // visitorCounter();
    //  setInterval(visitorCounter, 30000);
    fetchLastOrder();
  }, []);

  return (
    <MyContext.Provider
      value={{
        counter,
        token,
        lastOrder,
        postIdForDelete,
        rowSelectionModel,
        setRowSelectionModel,
        table,
        setTable,
        editAbleData,
        setEditAbleData,
        updateData,
        sales,
        fetchCounter,
        fetchInventory,
        inventoryTable,
        setInventoryTable,
        rowSelectionModelOrders,
        setRowSelectionModelOrders,
        orderFinishProcess,
        fetchAllOrders,
        pageState,
        setPageState,
        tableOrders,
        setTableOrders,
        flagOrders,
        setFlagOrders,
        bannerData,
        setBannerData,
        which,
        setWhich,
        fetchEditBanners,
        fetchEditCards,
        cardsData,
        choosenCards,
        setChoosenCards,
        formData,
        setCardsData,
        flagInsertItem,
        setFlagInsertItem
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  return useContext(MyContext);
};
MyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
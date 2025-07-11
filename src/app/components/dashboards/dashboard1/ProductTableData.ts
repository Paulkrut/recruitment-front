interface PerformerType {
    id: string;
    imgsrc: string;
    name: string;
    budget: number;
    percent: number;
  }
  
  const ProductTableData: PerformerType[] = [
    {
      id: "1",
      imgsrc: "/images/products/product-5.png",
      name: "iPhone 13 pro max-Pacific Blue-128GB storage",
      percent: 55,
      budget: 400
    },
    {
      id: "2",
      imgsrc: "/images/products/product-6.png",
      name: "Apple MacBook Pro 13 inch-M1-8/256GB-space",
      percent: 25,
      budget: 220
    },
    {
      id: "3",
      imgsrc: "/images/products/product-7.png",
      name: "PlayStation 5 DualSense Wireless Controller",
      percent: 15,
      budget: 155
    },
    {
      id: "4",
      imgsrc: "/images/products/product-8.png",
      name: "Amazon Basics Mesh, Mid-Back, Swivel Office De...",
      percent: 25,
      budget: 190
    },
    {
      id: "5",
      imgsrc: "/images/products/product-9.png",
      name: "Sony X85J 75 Inch Sony 4K Ultra HD LED Smart G...",
      percent: 55,
      budget: 136
    },
  ];
  
  export default ProductTableData;
  
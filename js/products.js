module.exports = {
  // Load Mock Product Data Into localStorage
  init: function() {
    localStorage.clear();
    localStorage.setItem('product', JSON.stringify([
      {
        description: 'Bra collection',
        bras: [
          {
            sku: 'LN332',
            name: 'Isla Bra',
            price: 29,
            image: bra1.jpg,
            inventory: 10

          },
          {
            sku: 'LN336',
            name: 'Nordic Rose Bra',
            price: 30,
            image: bra2.jpg,
            inventory: 10
          },
          {
            sku: 'FY240',
            name: 'Zentangle Bra',
            price: 34,
            image: bra3.jpg,
            inventory: 0
          },
          {
            sku: 'PN112',
            name: 'Clara Bra',
            price: 32,
            image: bra4.jpg,
            inventory: 1
          },
          {
            sku: 'FY158',
            name: 'Deco Delight Bra',
            price: 34,
            image: bra1.jpg,
            inventory: 1
          },
          {
            sku: 'LN328',
            name: 'Sienna Bra',
            price: 32,
            image: bra2.jpg,
            inventory: 1
          }
        ]
      }
    ]));
  }

};
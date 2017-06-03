module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "192.168.31.153",
      port: 8546,
      network_id: "*" // Match any network id
    }
  }
};

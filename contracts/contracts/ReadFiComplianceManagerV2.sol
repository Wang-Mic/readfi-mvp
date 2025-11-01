// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * ReadFiComplianceManagerV2 (Upgradeable)
 * ---------------------------------------
 * - 管理 ReadFi 使用者的合規性驗證紀錄（由 OPL 寫入）
 * - 可升級（UUPS Proxy）
 * - 可串接 Gateway 以便與其他合約（如 MintGateway）交互
 */
contract ReadFiComplianceManagerV2 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    /// @notice Oracle / OPL 寫入端
    address public opl;

    /// @notice Gateway (例如 NFT Mint Gateway)
    address public gateway;

    struct Receipt {
        bool ok;       // 是否通過驗證
        uint64 expiry; // 到期時間 (unix timestamp)
    }

    // user => skuId => receipt
    mapping(address => mapping(uint256 => Receipt)) public receipts;

    event OplUpdated(address indexed user, uint256 indexed skuId, bool ok, uint64 expiry, bytes32 ref);
    event GatewayChanged(address indexed newGateway);
    event OplChanged(address indexed newOpl);

    modifier onlyOPL() {
        require(msg.sender == opl, "not opl");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice 初始化（替代 constructor）
    /// @param _opl OPL 地址
    /// @param _gateway Gateway 地址
    function initialize(address _opl, address _gateway) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        opl = _opl;
        gateway = _gateway;
    }

    /// @notice 授權升級權限
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// @notice 修改 OPL 地址
    function setOPL(address _opl) external onlyOwner {
        opl = _opl;
        emit OplChanged(_opl);
    }

    /// @notice 修改 Gateway 地址
    function setGateway(address _gateway) external onlyOwner {
        gateway = _gateway;
        emit GatewayChanged(_gateway);
    }

    /// @notice OPL 寫入驗證結果
    function setReceipt(address user, uint256 skuId, bool ok, uint64 expiry, bytes32 ref) external onlyOPL {
        receipts[user][skuId] = Receipt(ok, expiry);
        emit OplUpdated(user, skuId, ok, expiry, ref);
    }

    /// @notice 檢查是否仍合規
    function isCompliant(address user, uint256 skuId) external view returns (bool) {
        Receipt memory r = receipts[user][skuId];
        return r.ok && r.expiry >= uint64(block.timestamp);
    }

    /// @notice 讀取紀錄
    function getReceipt(address user, uint256 skuId) external view returns (Receipt memory) {
        return receipts[user][skuId];
    }
}
